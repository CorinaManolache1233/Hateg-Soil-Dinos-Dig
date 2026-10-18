import {
    addCollectedItem,
    getCollectedItemIds,
    hasCollectedItem,
    INVENTORY_ITEMS,
    removeCollectedItem,
    resetCollectedItems
} from "../../systems/inventory.js";
import {
    beginSceneTransition,
    completeSceneTransition,
    collectLitter,
    getSavedProgress,
    resetGameSession,
    savePlayerPosition,
    setActiveScene
} from "../../systems/game-session.js";
import { addNavigationMenu } from "../../ui/navigation-menu.js";
import { createGameWorld } from "./world.js";

export function setupJoc() {
    scene("game", () => {
        completeSceneTransition("game");
        let isPaused = false;
        const SPEED = 350;

        const world = createGameWorld(() => isPaused);
        const {
            WORLD_DEPTH,
            WORLD_WIDTH,
            WORLD_CENTER_X,
            SURFACE_Y,
            LIMITA_SUS,
            skyClouds,
            skyBirds,
            discoveryObjects,
            discoveryState,
            gardenSignX,
            isAtGrassLevel,
            isInTunnelOrEntrance
        } = world;

        // --- 4. THE PLAYER (Magy) ---
        const savedProgressAtStart = getSavedProgress();
        const savedGamePosition = savedProgressAtStart.positions.game;
        const player = add([
            sprite("baby_dino"),
            scale(0.55), 
            pos(savedGamePosition?.x ?? WORLD_CENTER_X, savedGamePosition?.y ?? LIMITA_SUS),
            anchor("center"),
            area({ scale: 0.6 }),
            "player",
            z(50)
        ]);
        savePlayerPosition("game", player.pos.x, player.pos.y);
        const savePositionOnPageHide = () => savePlayerPosition("game", player.pos.x, player.pos.y);
        window.addEventListener("pagehide", savePositionOnPageHide);
        onSceneLeave(() => window.removeEventListener("pagehide", savePositionOnPageHide));

        const trashX = WORLD_CENTER_X + 220;
        const recyclableItems = ["plastic_bag", "plastic_bottle"];
        const hasRecyclables = () => getCollectedItemIds().some((itemId) => recyclableItems.includes(itemId));
        const recycleAllLitter = () => {
            let recycledCount = 0;
            getCollectedItemIds().forEach((itemId) => {
                if (recyclableItems.includes(itemId) && removeCollectedItem(itemId)) recycledCount++;
            });
            return recycledCount;
        };
        const isNearTrash = () => Math.abs(player.pos.x - (trashX + 29)) < 125
            && player.pos.y >= SURFACE_Y - 250
            && player.pos.y <= SURFACE_Y + 30;
        add([
            rect(58, 66, { radius: 8 }),
            pos(trashX, SURFACE_Y - 68),
            color(47, 132, 83),
            outline(3, rgb(30, 92, 57)),
            z(10)
        ]);
        add([
            rect(72, 10, { radius: 4 }),
            pos(trashX - 7, SURFACE_Y - 76),
            color(32, 105, 65),
            z(11)
        ]);
        add([
            text("RECYCLE", { size: 12 }),
            pos(trashX + 29, SURFACE_Y - 36),
            anchor("center"),
            color(240, 255, 239),
            z(12)
        ]);

        const gardenSignY = SURFACE_Y - 158;
        add([
            rect(16, SURFACE_Y - gardenSignY - 78, { radius: 4 }),
            pos(gardenSignX - 8, gardenSignY + 78),
            color(101, 65, 39),
            outline(2, rgb(73, 48, 31)),
            z(13)
        ]);
        add([
            rect(8, SURFACE_Y - gardenSignY - 78, { radius: 3 }),
            pos(gardenSignX - 4, gardenSignY + 78),
            color(143, 94, 55),
            z(14)
        ]);

        const gardenExit = add([
            rect(230, 88, { radius: 8 }),
            pos(gardenSignX - 115, gardenSignY),
            color(113, 77, 43),
            outline(4, rgb(73, 48, 31)),
            area(),
            "garden_exit",
            z(15)
        ]);
        gardenExit.add([
            rect(214, 72, { radius: 5 }),
            pos(8, 8),
            color(133, 91, 51),
            outline(2, rgb(202, 165, 107)),
            z(16)
        ]);
        gardenExit.add([
            text("→", { size: 38 }),
            pos(34, 41),
            anchor("center"),
            color(255, 243, 190),
            z(17)
        ]);
        gardenExit.add([
            text("HAȚEG GEOPARK", { size: 14, align: "center", width: 165 }),
            pos(132, 27),
            anchor("center"),
            color(255, 255, 255),
            z(17)
        ]);
        gardenExit.add([
            text("GARDEN", { size: 13, align: "center", width: 165 }),
            pos(132, 49),
            anchor("center"),
            color(255, 224, 153),
            z(17)
        ]);
        gardenExit.add([
            text("CLICK TO VISIT", { size: 9, align: "center", width: 165 }),
            pos(132, 67),
            anchor("center"),
            color(255, 255, 255),
            z(17)
        ]);

        let isEnteringGarden = savedProgressAtStart.activeScene === "game"
            && Math.abs(player.pos.x - gardenSignX) < 95
            && player.pos.y >= SURFACE_Y - 150
            && player.pos.y <= SURFACE_Y + 30;
        let progressSaveElapsed = 0;
        const trashHint = add([
            text("Press E to recycle all litter", { size: 18, align: "center" }),
            pos(width() / 2, height() - 36),
            anchor("center"),
            color(255, 255, 255),
            outline(2, rgb(31, 55, 37)),
            opacity(0),
            fixed(),
            z(510)
        ]);

        const pickupButtonWidth = Math.min(360, width() - 24);
        const pickupButtonHeight = 52;
        const pickupButton = add([
            rect(pickupButtonWidth, pickupButtonHeight, { radius: 14 }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(104, 67, 43),
            outline(2, rgb(231, 199, 142)),
            area(),
            fixed(),
            "pickup_button",
            z(511)
        ]);
        pickupButton.hidden = true;
        const pickupButtonLabel = add([
            text("PICK UP  [E]", { size: 16, align: "center", width: pickupButtonWidth - 24 }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(255, 255, 255),
            fixed(),
            z(512)
        ]);
        pickupButtonLabel.hidden = true;

        const collectNearbyDiscovery = () => {
            const item = discoveryState.nearby;
            if (isPaused || inventoryOpen || !item || !discoveryObjects.includes(item)) return false;
            if (!addCollectedItem(item.itemId)) return false;
            if (item.litterId) collectLitter(item.litterId);
            discoveryObjects.splice(discoveryObjects.indexOf(item), 1);
            discoveryState.nearby = null;
            destroy(item);
            refreshInventoryCount();
            openMagyDialogue(item.message, [255, 180, 100], "ADD TO BACKPACK");
            return true;
        };

        onUpdate(() => {
            skyClouds.forEach(({ object, speed }) => {
                object.move(speed, 0);
                if (object.pos.x > WORLD_WIDTH + 150) object.pos.x = -150;
            });
            skyBirds.forEach(({ object, speed }) => {
                object.move(speed, 0);
                if (object.pos.x > WORLD_WIDTH + 80) object.pos.x = -80;
            });

            // LOGICĂ NOUĂ PENTRU REZOLVAREA PROBLEMELOR CU CERUL:
            if (player.pos.y <= SURFACE_Y) {
                // Dacă e pe iarbă, nu are voie să plece din lățimea fixă a ecranului său inițial
                const limitLeft = WORLD_CENTER_X - width() / 2 + 50;
                const limitRight = WORLD_CENTER_X + width() / 2 - 50;
                player.pos.x = clamp(player.pos.x, limitLeft, limitRight);
            } else {
                // Dacă e în subteran, se deblochează toată harta în laterale
                player.pos.x = clamp(player.pos.x, 150, WORLD_WIDTH - 150);
            }

            player.pos.y = clamp(player.pos.y, LIMITA_SUS, WORLD_DEPTH - 50);
            if (player.pos.y > LIMITA_SUS && !isInTunnelOrEntrance(player.pos.x, player.pos.y)) {
                player.pos.y = LIMITA_SUS;
            }
            if (isEnteringGarden && Math.abs(player.pos.x - gardenSignX) >= 160) {
                isEnteringGarden = false;
            }
            discoveryState.nearby = null;
            let nearestDistanceSquared = 115 * 115;
            for (const item of discoveryObjects) {
                const distanceX = player.pos.x - item.pos.x;
                const distanceY = player.pos.y - item.pos.y;
                const distanceSquared = distanceX * distanceX + distanceY * distanceY;
                if (distanceSquared < nearestDistanceSquared) {
                    discoveryState.nearby = item;
                    nearestDistanceSquared = distanceSquared;
                }
            }
            const showPickupPrompt = !isPaused && !inventoryOpen && Boolean(discoveryState.nearby);
            pickupButton.hidden = !showPickupPrompt;
            pickupButtonLabel.hidden = !showPickupPrompt;
            if (discoveryState.nearby) {
                const itemName = INVENTORY_ITEMS[discoveryState.nearby.itemId].name;
                pickupButtonLabel.text = `PICK UP  [E]  ·  ${itemName}`;
            }
            trashHint.opacity = !discoveryState.nearby && isNearTrash() && hasRecyclables() ? 1 : 0;
            gardenExit.hidden = false;
            if (!isPaused
                && !isEnteringGarden
                && Math.abs(player.pos.x - gardenSignX) < 95
                && player.pos.y >= SURFACE_Y - 150
                && player.pos.y <= SURFACE_Y + 30) {
                if (!beginSceneTransition("garden")) return;
                isEnteringGarden = true;
                savePlayerPosition("game", player.pos.x, player.pos.y);
                setActiveScene("garden");
                go("loading", "garden");
            }

            // Camera urmărește jucătorul, dar nu depășește niciodată limitele lumii
            const minCameraX = width() / 2;
            const maxCameraX = WORLD_WIDTH - width() / 2;
            const minCameraY = height() / 2;
            const maxCameraY = WORLD_DEPTH - height() / 2;
            
            camPos(
                clamp(player.pos.x, minCameraX, maxCameraX), 
                clamp(player.pos.y, minCameraY, maxCameraY)
            );
            const playerScreenPosition = toScreen(player.pos);
            pickupButton.pos = vec2(
                clamp(playerScreenPosition.x, pickupButtonWidth / 2 + 12, width() - pickupButtonWidth / 2 - 12),
                clamp(playerScreenPosition.y - 155, pickupButtonHeight / 2 + 12, height() - pickupButtonHeight / 2 - 12)
            );
            pickupButtonLabel.pos = pickupButton.pos;
            progressSaveElapsed += dt();
            if (progressSaveElapsed >= 0.25) {
                savePlayerPosition("game", player.pos.x, player.pos.y);
                progressSaveElapsed = 0;
            }

        });

        // --- 5. MOVEMENT CONTROLS ---
        onKeyDown("left", () => {
            if (isPaused) return;
            const nextX = player.pos.x - SPEED * dt();
            if (!isAtGrassLevel(player.pos.y) && !isInTunnelOrEntrance(nextX, player.pos.y)) return;
            player.flipX = false;
            player.move(-SPEED, 0);
        });
        onKeyDown("right", () => {
            if (isPaused) return;
            const nextX = player.pos.x + SPEED * dt();
            if (!isAtGrassLevel(player.pos.y) && !isInTunnelOrEntrance(nextX, player.pos.y)) return;
            player.flipX = true;
            player.move(SPEED, 0);
        });
        onKeyDown("up", () => {
            if (isPaused) return;
            const nextY = Math.max(player.pos.y - SPEED * dt(), LIMITA_SUS);
            if (!isAtGrassLevel(nextY) && !isInTunnelOrEntrance(player.pos.x, nextY)) return;
            player.move(0, -SPEED);
        });
        onKeyDown("down", () => {
            if (isPaused) return;
            const nextY = player.pos.y + SPEED * dt();

            if (!isAtGrassLevel(nextY) && !isInTunnelOrEntrance(player.pos.x, nextY)) return;
            player.move(0, SPEED);
        });

        // --- 6. MAGY'S DIALOGUE SYSTEM ---
        let activeDialogue = null;
        const dialogueTag = "magy_dialog";
        
        const closeDialogue = () => {
            if (!activeDialogue) return;
            if (activeDialogue.elapsed < activeDialogue.duration) {
                activeDialogue.elapsed = activeDialogue.duration;
                activeDialogue.speech.text = activeDialogue.message;
                return;
            }
            destroyAll(dialogueTag);
            activeDialogue = null;
            isPaused = false;
            setCursor("default");
        };

        const openMagyDialogue = (message, accentColor, buttonLabel) => {
            isPaused = true;
            setCursor("default");

            const isNarrow = width() < 720;
            const centerX = width() / 2;
            const bubbleWidth = isNarrow ? width() * 0.9 : Math.min(width() * 0.46, 620);
            const bubbleHeight = isNarrow ? Math.min(height() * 0.42, 360) : Math.min(height() * 0.6, 450);
            const bubbleX = isNarrow ? centerX : width() * 0.65;
            const bubbleY = isNarrow ? height() * 0.32 : height() * 0.5;
            const bubbleRadius = Math.min(96, bubbleHeight * 0.38);
            const magyScale = isNarrow
                ? Math.min(0.64, height() * 0.00105)
                : Math.min(1.25, height() * 0.0017);
            const magyX = isNarrow ? centerX : width() * 0.29;
            const magyY = height() - 12 - 205 * magyScale;

            add([ rect(width(), height()), pos(0, 0), color(13, 25, 30), opacity(0.74), fixed(), dialogueTag, z(399) ]);
            add([
                sprite("baby_dino"),
                pos(magyX, magyY),
                anchor("center"),
                scale(magyScale),
                fixed(),
                dialogueTag,
                z(400)
            ]);

            const thoughtDots = isNarrow
                ? [
                    { x: bubbleX, y: bubbleY + bubbleHeight / 2 + 14, radius: 7 },
                    { x: bubbleX, y: bubbleY + bubbleHeight / 2 + 35, radius: 11 },
                    { x: bubbleX, y: bubbleY + bubbleHeight / 2 + 62, radius: 16 }
                ]
                : [
                    { x: bubbleX - bubbleWidth / 2 - 37, y: bubbleY + 55, radius: 7 },
                    { x: bubbleX - bubbleWidth / 2 - 24, y: bubbleY + 35, radius: 11 },
                    { x: bubbleX - bubbleWidth / 2 - 7, y: bubbleY + 12, radius: 16 }
                ];
            thoughtDots.forEach(({ x, y, radius }) => {
                add([
                    circle(radius),
                    pos(x, y),
                    anchor("center"),
                    color(249, 246, 231),
                    outline(2, rgb(217, 177, 102)),
                    fixed(),
                    dialogueTag,
                    z(401)
                ]);
            });

            add([
                rect(bubbleWidth, bubbleHeight, { radius: bubbleRadius }),
                pos(bubbleX, bubbleY),
                anchor("center"),
                color(249, 246, 231),
                outline(4, rgb(217, 177, 102)),
                fixed(),
                dialogueTag,
                z(402)
            ]);

            const speech = add([
                text("", {
                    size: isNarrow ? Math.max(19, Math.min(23, width() * 0.055)) : Math.max(24, Math.min(32, width() * 0.042)),
                    align: "center",
                    width: bubbleWidth * 0.84,
                    font: "cursive",
                    lineSpacing: 5
                }),
                pos(bubbleX, bubbleY - 22),
                anchor("center"),
                color(61, 69, 58),
                fixed(),
                dialogueTag,
                z(403)
            ]);

            const closeButton = add([
                rect(Math.min(220, bubbleWidth * 0.66), 44, { radius: 22 }),
                pos(bubbleX, bubbleY + bubbleHeight * 0.34),
                anchor("center"),
                color(...accentColor),
                area(),
                fixed(),
                dialogueTag,
                "magy_dialog_continue",
                z(404)
            ]);
            closeButton.add([ text(buttonLabel, { size: 18 }), anchor("center"), color(255, 255, 255) ]);

            closeButton.onHover(() => { closeButton.color = rgb(...accentColor.map((channel) => Math.min(255, channel + 28))); setCursor("pointer"); });
            closeButton.onHoverEnd(() => { closeButton.color = rgb(...accentColor); setCursor("default"); });

            activeDialogue = { elapsed: 0, duration: message.length * 0.026, message, speech };
        };

        onUpdate(() => {
            if (!activeDialogue) return;
            activeDialogue.elapsed = Math.min(activeDialogue.elapsed + dt(), activeDialogue.duration);
            const visibleCharacters = Math.floor(activeDialogue.elapsed / 0.026);
            activeDialogue.speech.text = activeDialogue.message.slice(0, visibleCharacters);
        });

        const inventoryTag = "inventory_panel";
        let inventoryOpen = false;
        const isNarrowUI = width() < 480;
        const backpackWidth = isNarrowUI ? 142 : 176;
        const uiGap = isNarrowUI ? 5 : 10;
        const uiContainer = add([
            fixed(),
            pos(Math.max(12, width() - backpackWidth - uiGap - 42 - (isNarrowUI ? 12 : 30)), isNarrowUI ? 18 : 30),
            z(500)
        ]);

        const backpackButton = uiContainer.add([
            rect(backpackWidth, 40, { radius: 10 }),
            pos(0, 0),
            color(104, 67, 43),
            outline(2, rgb(231, 199, 142)),
            area(),
            "backpack_button",
            z(500),
            "ui_backpack"
        ]);
        backpackButton.add([
            rect(26, 25, { radius: 7 }),
            pos(11, 10),
            color(197, 130, 72),
            outline(2, rgb(250, 220, 166))
        ]);
        backpackButton.add([
            rect(13, 7, { radius: 3 }),
            pos(17, 5),
            color(151, 99, 57),
            outline(1, rgb(250, 220, 166))
        ]);
        backpackButton.add([
            rect(16, 10, { radius: 3 }),
            pos(16, 21),
            color(165, 104, 59),
            outline(1, rgb(250, 220, 166))
        ]);
        backpackButton.add([
            text(isNarrowUI ? "BAG" : "BACKPACK", { size: isNarrowUI ? 13 : 14 }),
            pos(isNarrowUI ? 69 : 79, 20),
            anchor("center"),
            color(255, 255, 255)
        ]);
        const inventoryCount = backpackButton.add([
            text("0", { size: 15 }),
            pos(backpackWidth - 15, 20),
            anchor("center"),
            color(255, 226, 133)
        ]);
        const helpButton = uiContainer.add([
            circle(16),
            pos(backpackWidth + uiGap + 16, 20),
            anchor("center"),
            color(53, 89, 68),
            outline(2, rgb(226, 235, 201)),
            area(),
            "backpack_help"
        ]);
        helpButton.add([text("?", { size: 19 }), anchor("center"), color(255, 255, 255)]);

        const refreshInventoryCount = () => {
            inventoryCount.text = String(getCollectedItemIds().length);
        };
        refreshInventoryCount();

        const closeInventory = () => {
            destroyAll(inventoryTag);
            inventoryOpen = false;
        };

        const openInventory = () => {
            inventoryOpen = true;
            const isNarrow = width() < 520;
            const panelWidth = Math.min(isNarrow ? width() * 0.9 : 460, width() - 32);
            const panelHeight = 390;
            const panelX = width() / 2;
            const panelY = height() / 2;
            const itemIds = getCollectedItemIds();
            const itemCounts = itemIds.reduce((counts, itemId) => {
                counts[itemId] = (counts[itemId] ?? 0) + 1;
                return counts;
            }, {});

            add([rect(width(), height()), pos(0, 0), color(13, 25, 30), opacity(0.68), fixed(), inventoryTag, z(520)]);
            add([
                rect(panelWidth, panelHeight, { radius: 22 }),
                pos(panelX, panelY),
                anchor("center"),
                color(249, 246, 231),
                outline(3, rgb(217, 177, 102)),
                fixed(),
                inventoryTag,
                z(521)
            ]);
            add([
                text("MAGY'S BACKPACK", { size: 24, font: "cursive" }),
                pos(panelX, panelY - panelHeight / 2 + 34),
                anchor("center"),
                color(61, 69, 58),
                fixed(),
                inventoryTag,
                z(522)
            ]);

            if (itemIds.length === 0) {
                add([
                    text("Your backpack is empty. Explore the tunnels to find something!", {
                        size: 19,
                        align: "center",
                        width: panelWidth * 0.82
                    }),
                    pos(panelX, panelY),
                    anchor("center"),
                    color(61, 69, 58),
                    fixed(),
                    inventoryTag,
                    z(522)
                ]);
            } else {
                Object.entries(itemCounts).forEach(([itemId, count], index) => {
                    const item = INVENTORY_ITEMS[itemId];
                    const rowY = panelY - panelHeight / 2 + 90 + index * 52;
                    add([
                        sprite(item.sprite),
                        pos(panelX - panelWidth * 0.38, rowY),
                        anchor("center"),
                        scale(itemId.startsWith("plastic_") ? 0.1 : 0.09),
                        fixed(),
                        inventoryTag,
                        z(522)
                    ]);
                    add([
                        text(count > 1 ? `${item.name} x${count}` : item.name, { size: 18, width: panelWidth * 0.65 }),
                        pos(panelX - panelWidth * 0.27, rowY),
                        anchor("left"),
                        color(61, 69, 58),
                        fixed(),
                        inventoryTag,
                        z(522)
                    ]);
                });
            }

            const closeButton = add([
                rect(140, 38, { radius: 19 }),
                pos(panelX, panelY + panelHeight / 2 - 32),
                anchor("center"),
                color(52, 112, 76),
                area(),
                fixed(),
                inventoryTag,
                "inventory_close",
                z(523)
            ]);
            closeButton.add([text("CLOSE", { size: 15 }), anchor("center"), color(255, 255, 255)]);
        };

        onClick("backpack_button", () => {
            if (inventoryOpen) closeInventory();
            else openInventory();
        });
        onClick("backpack_help", () => {
            if (isPaused) return;
            openMagyDialogue(
                "This is my backpack! It keeps the fossils and useful things I find while exploring. Bring any plastic bags and bottles I collect to the green recycling bin, then press E to recycle one.",
                [217, 177, 102],
                "GOT IT"
            );
        });
        onClick("inventory_close", closeInventory);
        onKeyPress("escape", () => {
            if (inventoryOpen) closeInventory();
        });

        // --- 7. INTERACTIONS ---
        onClick("soil_zone", (sign) => {
            if (isPaused) return;
            openMagyDialogue(sign.zoneData.speech, sign.zoneData.accentColor, "KEEP EXPLORING");
        });

        onClick("garden_exit", () => {
            if (isPaused || player.pos.y > SURFACE_Y + 30 || isEnteringGarden) return;
            if (!beginSceneTransition("garden")) return;
            isEnteringGarden = true;
            savePlayerPosition("game", player.pos.x, player.pos.y);
            setActiveScene("garden");
            go("loading", "garden");
        });
        onKeyPress("e", () => {
            if (isPaused) return;
            if (collectNearbyDiscovery()) return;
            if (!isNearTrash()) return;
            const recycledCount = recycleAllLitter();
            if (recycledCount === 0) return;

            refreshInventoryCount();
            openMagyDialogue(`I recycled all ${recycledCount} piece${recycledCount === 1 ? "" : "s"} of litter! Thanks for helping keep this place clean and protect the wildlife.`, [100, 180, 110], "NICE WORK");
        });

        onClick("pickup_button", collectNearbyDiscovery);
        onHoverUpdate("pickup_button", (button) => {
            if (button.hidden || isPaused) return;
            button.color = rgb(125, 82, 52);
            setCursor("pointer");
        });
        onHoverEnd("pickup_button", (button) => {
            button.color = rgb(104, 67, 43);
            setCursor("default");
        });

        onClick("magy_dialog_continue", closeDialogue);
        onKeyPress("enter", closeDialogue);

        // --- 8. MINIMALIST UI BUTTONS ---
        onHoverUpdate("ui_backpack", (b) => { b.color = rgb(125, 82, 52); setCursor("pointer"); });
        onHoverEnd("ui_backpack", (b) => { b.color = rgb(104, 67, 43); setCursor("default"); });
        onHoverUpdate("backpack_help", () => setCursor("pointer"));
        onHoverEnd("backpack_help", () => setCursor("default"));
        onHoverUpdate("garden_exit", () => setCursor("pointer"));
        onHoverEnd("garden_exit", () => setCursor("default"));

        addNavigationMenu({
            canToggle: () => !activeDialogue,
            onOpenChange: (open) => {
                if (open && inventoryOpen) closeInventory();
                isPaused = open;
            },
            onNavigate: (destination) => {
                setCursor("default");
                if (destination === "restart") {
                    resetCollectedItems();
                    resetGameSession();
                    go("loading", "game");
                    return;
                }
                savePlayerPosition("game", player.pos.x, player.pos.y);

                if (destination === "game") return;
                if (destination === "garden") {
                    if (!beginSceneTransition("garden")) return;
                    setActiveScene("garden");
                    go("loading", "garden");
                    return;
                }
                setActiveScene("game");
                go("loading", destination === "start" ? "menu" : "story");
            }
        });
    });
}
import {
    beginSceneTransition,
    completeSceneTransition,
    getGardenPlotStates,
    getGardenPlotPlantTimes,
    getSavedProgress,
    resetGameSession,
    saveGardenPlotStates,
    savePlayerPosition,
    setActiveScene
} from "../../systems/game-session.js";
import { resetCollectedItems } from "../../systems/inventory.js";
import { addNavigationMenu } from "../../ui/navigation-menu.js";
import { createGardenEnvironment } from "./environment.js";
import { drawGardenPlant } from "./plant-visuals.js";

export function setupGradina() {
    let gardenBackpack = { carrot: 0, tomato: 0, potato: 0 };
    let shedStorage = { carrot: 0, tomato: 0, potato: 0 };

    scene("haeg_garden", () => {
        completeSceneTransition("garden");
        camPos(width() / 2, height() / 2);
        camScale(1);
        const gardenPlotStates = getGardenPlotStates();
        const savedGardenPosition = getSavedProgress().positions.garden;
        
        const groundY = height() * 0.66;
        const topMovementLimit = groundY - 88; 
        
        const returnSignX = width() * 0.12;
        const returnSignY = groundY - 125;
        const shedX = width() * 0.88;
        const shedY = groundY;
        const playerSpeed = 280;
        const GROW_TIME = 5; 

        let isPaused = false;
        const gardenPlotPlantTimes = getGardenPlotPlantTimes();
        
        const plotDefinitions = [
            { x: 0.35, offset: -0.065, species: "carrot" },
            { x: 0.35, offset: 0, species: "carrot" },
            { x: 0.35, offset: 0.065, species: "carrot" },
            { x: 0.52, offset: -0.065, species: "tomato" },
            { x: 0.52, offset: 0, species: "tomato" },
            { x: 0.52, offset: 0.065, species: "tomato" },
            { x: 0.69, offset: -0.065, species: "potato" },
            { x: 0.69, offset: 0, species: "potato" },
            { x: 0.69, offset: 0.065, species: "potato" }
        ];
        const plots = plotDefinitions.map((definition, index) => ({
            ...definition,
            x: width() * (definition.x + definition.offset),
            state: gardenPlotStates[index] || 0,
            growProgress: 0,
            plantedAt: gardenPlotPlantTimes[index]
        }));
        let restoredMissingPlantTime = false;
        plots.forEach((plot, index) => {
            if ((plot.state === 1 || plot.state === 2) && plot.plantedAt === null) {
                plot.plantedAt = Date.now();
                gardenPlotPlantTimes[index] = plot.plantedAt;
                restoredMissingPlantTime = true;
            }
        });
        if (restoredMissingPlantTime) saveGardenPlotStates(gardenPlotStates, gardenPlotPlantTimes);

        // ==========================================
        // FUNDAL (CER, NORI, MUNTI)
        // ==========================================
        const { clouds } = createGardenEnvironment({ groundY, shedX, shedY });

        const player = add([
            sprite("baby_dino"),
            pos(savedGardenPosition?.x ?? Math.min(width() - 35, Math.max(width() * 0.3, returnSignX + 125)), topMovementLimit),
            anchor("center"), scale(0.42), area({ scale: 0.6 }), "garden_player", z(100)
        ]);
        savePlayerPosition("garden", player.pos.x, player.pos.y);
        const savePositionOnPageHide = () => savePlayerPosition("garden", player.pos.x, player.pos.y);
        window.addEventListener("pagehide", savePositionOnPageHide);
        onSceneLeave(() => window.removeEventListener("pagehide", savePositionOnPageHide));
        let progressSaveElapsed = 0;

        // ==========================================
        // TEXT TEMPORAR PENTRU INSTRUCTIUNI
        // ==========================================
        let statusTimer = 0;
        const statusText = add([
            text("Welcome to the garden!", { size: Math.max(16, width() * 0.015), align: "center", width: Math.min(width() * 0.8, 720) }),
            pos(width() / 2, height() - 30), anchor("center"), color(255, 255, 255), outline(2, rgb(48, 91, 48)), fixed(), z(20), opacity(1)
        ]);
        statusTimer = 4; // arata 4 secunde la inceput

        const showStatusMessage = (msg, duration = 3) => {
            statusText.text = msg;
            statusText.opacity = 1;
            statusTimer = duration;
        };

        // ==========================================
        // VIZUAL PLANTE & RĂDĂCINI IN PĂMÂNT
        // ==========================================
        const drawPlant = (plot, plotIndex) => drawGardenPlant(plot, plotIndex, groundY);

        const updatePlotGrowth = (plot, plotIndex) => {
            if (plot.state !== 1 && plot.state !== 2) {
                plot.growProgress = 0;
                return false;
            }

            const elapsed = Math.max(0, (Date.now() - plot.plantedAt) / 1000);
            const nextState = Math.min(3, 1 + Math.floor(elapsed / GROW_TIME));
            plot.growProgress = nextState === 3 ? 0 : elapsed % GROW_TIME;
            if (nextState === plot.state) return false;

            plot.state = nextState;
            if (nextState === 3) {
                plot.plantedAt = null;
                gardenPlotPlantTimes[plotIndex] = null;
            }
            gardenPlotStates[plotIndex] = plot.state;
            saveGardenPlotStates(gardenPlotStates, gardenPlotPlantTimes);
            drawPlant(plot, plotIndex);
            return true;
        };

        // PARCELELE DE SUPRAFATĂ ȘI TĂBLIȚELE DE LEMN
        const plotGroups = [
            { x: width() * 0.35, species: "carrot", label: "CARROTS" },
            { x: width() * 0.52, species: "tomato", label: "TOMATOES" },
            { x: width() * 0.69, species: "potato", label: "POTATOES" }
        ];
        plotGroups.forEach((group) => {
            const bedWidth = width() * 0.17;
            add([
                rect(bedWidth, 15, { radius: 7 }), pos(group.x, groundY), anchor("center"),
                color(83, 56, 39), z(8)
            ]);
            add([
                rect(bedWidth - 16, 8, { radius: 4 }), pos(group.x, groundY - 3), anchor("center"),
                color(103, 68, 43), z(9)
            ]);

            const signY = groundY - 22;
            add([ rect(6, 30), pos(group.x, signY + 12), anchor("center"), color(101, 65, 39), z(8) ]);
            add([ rect(Math.min(bedWidth, 120), 26, { radius: 3 }), pos(group.x, signY), anchor("center"), color(143, 94, 55), outline(2, rgb(80, 50, 20)), z(9) ]);
            add([ text(group.label, { size: 14 }), pos(group.x, signY), anchor("center"), color(255, 240, 208), z(10) ]);
        });

        plots.forEach((plot, plotIndex) => {
            if (plot.species === "carrot" || plot.species === "potato" || plot.species === "tomato") {
                plot.plantingSpot = add([
                    circle(9), pos(plot.x, groundY + 9), anchor("center"),
                    color(55, 39, 27), opacity(plot.state === 0 ? 0.8 : 0.16), z(10)
                ]);
            }
            add([ 
                rect(Math.min(72, width() * 0.065), 110, { radius: 7 }), pos(plot.x, groundY + 22), anchor("center"),
                area(), "garden_plot", { plotIndex }, opacity(0), z(11)
            ]);

            plot.clock = add([ circle(10), pos(plot.x, groundY - 45), anchor("center"), color(255, 255, 255), outline(2, rgb(80, 80, 80)), opacity(0), z(20) ]);
            plot.hand = plot.clock.add([ rect(2, 8), pos(0, 0), anchor("bot"), rotate(0), color(50, 50, 50), opacity(0), z(21) ]);

            updatePlotGrowth(plot, plotIndex);
            drawPlant(plot, plotIndex);
        });

        // ==========================================
        // UI & BACKPACK (RUCSAC GRĂDINĂ)
        // ==========================================
        let inventoryOpen = false;
        const inventoryTag = "garden_inventory";
        const uiContainer = add([fixed(), pos(Math.max(12, width() - 242), 30), z(500)]);
        
        const backpackButton = uiContainer.add([
            rect(160, 40, { radius: 10 }), pos(0, 0), color(104, 67, 43), outline(2, rgb(231, 199, 142)), area(), "garden_backpack_button"
        ]);
        backpackButton.add([ text("BACKPACK", { size: 14 }), pos(70, 20), anchor("center"), color(255, 255, 255) ]);
        const inventoryCountText = backpackButton.add([ text("0", { size: 15 }), pos(140, 20), anchor("center"), color(255, 226, 133) ]);
        const gardenHelpButton = uiContainer.add([
            rect(42, 40, { radius: 10 }), pos(170, 0), color(52, 112, 76), outline(2, rgb(231, 199, 142)), area(), "garden_help_button"
        ]);
        gardenHelpButton.add([ text("?", { size: 24 }), pos(21, 20), anchor("center"), color(255, 255, 255) ]);

        const updateBackpackCount = () => {
            const total = gardenBackpack.carrot + gardenBackpack.tomato + gardenBackpack.potato;
            inventoryCountText.text = String(total);
        };
        updateBackpackCount();

        const closeInventory = () => { destroyAll(inventoryTag); inventoryOpen = false; };
        const openInventory = () => {
            inventoryOpen = true;
            const panelWidth = 400; const panelHeight = 350;
            const panelX = width() / 2; const panelY = height() / 2;

            add([rect(width(), height()), pos(0, 0), color(13, 25, 30), opacity(0.68), fixed(), inventoryTag, z(520)]);
            add([ rect(panelWidth, panelHeight, { radius: 22 }), pos(panelX, panelY), anchor("center"), color(249, 246, 231), outline(3, rgb(217, 177, 102)), fixed(), inventoryTag, z(521) ]);
            add([ text("HARVEST BACKPACK", { size: 24, font: "cursive" }), pos(panelX, panelY - panelHeight / 2 + 40), anchor("center"), color(61, 69, 58), fixed(), inventoryTag, z(522) ]);

            const total = gardenBackpack.carrot + gardenBackpack.tomato + gardenBackpack.potato;
            if (total === 0) {
                add([ text("Empty! Harvest some crops first.", { size: 18, align: "center", width: panelWidth * 0.8 }), pos(panelX, panelY), anchor("center"), color(61, 69, 58), fixed(), inventoryTag, z(522) ]);
            } else {
                let yOffset = panelY - 50;
                ["carrot", "tomato", "potato"].forEach((item) => {
                    if (gardenBackpack[item] > 0) {
                        add([ text(`${item.toUpperCase()}:  ${gardenBackpack[item]}`, { size: 20 }), pos(panelX, yOffset), anchor("center"), color(61, 69, 58), fixed(), inventoryTag, z(522) ]);
                        yOffset += 40;
                    }
                });
                add([ text("Click the Storage Shed to deposit these!", { size: 14 }), pos(panelX, yOffset + 20), anchor("center"), color(100, 150, 100), fixed(), inventoryTag, z(522) ]);
            }

            const closeBtn = add([ rect(140, 38, { radius: 19 }), pos(panelX, panelY + panelHeight / 2 - 40), anchor("center"), color(52, 112, 76), area(), fixed(), inventoryTag, "inventory_close", z(523) ]);
            closeBtn.add([text("CLOSE", { size: 15 }), anchor("center"), color(255, 255, 255)]);
        };

        onClick("garden_backpack_button", () => { if (inventoryOpen) closeInventory(); else openInventory(); });
        onClick("inventory_close", closeInventory);
        onHoverUpdate("garden_backpack_button", (b) => { b.color = rgb(125, 82, 52); setCursor("pointer"); });
        onHoverEnd("garden_backpack_button", (b) => { b.color = rgb(104, 67, 43); setCursor("default"); });

        // ==========================================
        // DIALOGUE SYSTEM (MAGY IN GARDEN)
        // ==========================================
        let activeDialogue = null;
        const dialogueTag = "magy_dialog";
        const closeDialogue = () => {
            if (!activeDialogue) return;
            if (activeDialogue.elapsed < activeDialogue.duration) {
                activeDialogue.elapsed = activeDialogue.duration; activeDialogue.speech.text = activeDialogue.message; return;
            }
            destroyAll(dialogueTag); activeDialogue = null; isPaused = false; setCursor("default");
        };

        const openMagyDialogue = (message, accentColor, buttonLabel, instant = false) => {
            if(inventoryOpen) closeInventory();
            isPaused = true; setCursor("default");
            const centerX = width() / 2;
            const bubbleWidth = Math.min(width() * 0.46, 620);
            const bubbleHeight = Math.min(height() * 0.6, 450);
            const bubbleX = width() * 0.65; const bubbleY = height() * 0.5;
            const magyScale = Math.min(1.25, height() * 0.0017);
            const magyX = width() * 0.29; const magyY = height() - 12 - 205 * magyScale;

            add([ rect(width(), height()), pos(0, 0), color(13, 25, 30), opacity(0.74), fixed(), dialogueTag, z(399) ]);
            add([ sprite("baby_dino"), pos(magyX, magyY), anchor("center"), scale(magyScale), fixed(), dialogueTag, z(400) ]);
            
            [ { x: bubbleX - bubbleWidth / 2 - 37, y: bubbleY + 55, radius: 7 }, { x: bubbleX - bubbleWidth / 2 - 24, y: bubbleY + 35, radius: 11 }, { x: bubbleX - bubbleWidth / 2 - 7, y: bubbleY + 12, radius: 16 } ].forEach(({ x, y, radius }) => {
                add([ circle(radius), pos(x, y), anchor("center"), color(249, 246, 231), outline(2, rgb(217, 177, 102)), fixed(), dialogueTag, z(401) ]);
            });
            
            add([ rect(bubbleWidth, bubbleHeight, { radius: 96 }), pos(bubbleX, bubbleY), anchor("center"), color(249, 246, 231), outline(4, rgb(217, 177, 102)), fixed(), dialogueTag, z(402) ]);
            const speech = add([ text("", { size: 24, align: "center", width: bubbleWidth * 0.84, font: "cursive", lineSpacing: 5 }), pos(bubbleX, bubbleY - 22), anchor("center"), color(61, 69, 58), fixed(), dialogueTag, z(403) ]);
            
            const closeBtn = add([ rect(220, 44, { radius: 22 }), pos(bubbleX, bubbleY + bubbleHeight * 0.34), anchor("center"), color(...accentColor), area(), fixed(), dialogueTag, "magy_dialog_continue", z(404) ]);
            closeBtn.add([ text(buttonLabel, { size: 18 }), anchor("center"), color(255, 255, 255) ]);
            closeBtn.onHover(() => { closeBtn.color = rgb(...accentColor.map(c => Math.min(255, c + 28))); setCursor("pointer"); });
            closeBtn.onHoverEnd(() => { closeBtn.color = rgb(...accentColor); setCursor("default"); });
            
            activeDialogue = {
                elapsed: instant ? message.length * 0.026 : 0,
                duration: message.length * 0.026,
                message,
                speech
            };
            if (instant) speech.text = message;
        };
        onClick("magy_dialog_continue", closeDialogue);
        onClick("garden_help_button", () => {
            if (isPaused) return;
            openMagyDialogue(
                "• Click a dark spot to plant.\n• Click a grown crop—even underground—to harvest.\n• Store crops in the shed.",
                [100, 180, 110],
                "GOT IT",
                true
            );
        });
        onHoverUpdate("garden_help_button", (button) => {
            button.color = rgb(73, 142, 96);
            setCursor("pointer");
            showStatusMessage("Click for garden instructions.", 0.2);
        });
        onHoverEnd("garden_help_button", (button) => {
            button.color = rgb(52, 112, 76);
            setCursor("default");
        });

        // ==========================================
        // PLOT & SHED INTERACTIONS (CLICK & HOVER)
        // ==========================================
        const interactWithPlot = (plotIndex) => {
            if (isPaused || inventoryOpen) return;
            const plot = plots[plotIndex];
            
            if (plot.state === 0) {
                plot.state = 1;
                plot.growProgress = 0;
                plot.plantedAt = Date.now();
                gardenPlotPlantTimes[plotIndex] = plot.plantedAt;
                gardenPlotStates[plotIndex] = plot.state;
                saveGardenPlotStates(gardenPlotStates, gardenPlotPlantTimes);
                drawPlant(plot, plotIndex);
                showStatusMessage(`Planted ${plot.species}!`, 3);
            } 
            else if (plot.state === 3) {
                plot.state = 0;
                plot.growProgress = 0;
                plot.plantedAt = null;
                gardenPlotPlantTimes[plotIndex] = null;
                gardenPlotStates[plotIndex] = plot.state;
                saveGardenPlotStates(gardenPlotStates, gardenPlotPlantTimes);
                drawPlant(plot, plotIndex);
                
                gardenBackpack[plot.species]++;
                updateBackpackCount();
                showStatusMessage(`You harvested a ${plot.species}!`, 3);
            }
        };

        onClick("garden_plot", (plot) => interactWithPlot(plot.plotIndex));
        onHoverUpdate("garden_plot", (plotData) => {
            if (isPaused || inventoryOpen) return;
            setCursor("pointer");
            const p = plots[plotData.plotIndex];
            if (p.state === 0) showStatusMessage(`Click to plant ${p.species} seeds.`, 0.2);
            else if (p.state === 1 || p.state === 2) showStatusMessage(`Plant is growing... (${Math.max(0, Math.ceil(GROW_TIME - p.growProgress))}s)`, 0.2);
            else showStatusMessage(`Crop is ready! Click to harvest.`, 0.2);
        });
        onHoverEnd("garden_plot", () => { setCursor("default"); });

        onClick("storage_shed", () => {
            if (isPaused || inventoryOpen) return;
            const totalToStore = gardenBackpack.carrot + gardenBackpack.tomato + gardenBackpack.potato;
            
            if (totalToStore === 0) {
                openMagyDialogue("Your backpack is empty! Click the crops to harvest them first before depositing.", [217, 177, 102], "OKAY");
                return;
            }
            
            shedStorage.carrot += gardenBackpack.carrot;
            shedStorage.tomato += gardenBackpack.tomato;
            shedStorage.potato += gardenBackpack.potato;
            
            gardenBackpack.carrot = 0; gardenBackpack.tomato = 0; gardenBackpack.potato = 0;
            updateBackpackCount();
            
            openMagyDialogue(`Great job! I stored ${totalToStore} fresh crops in the shed. Safe and sound!`, [100, 180, 110], "AWESOME");
        });
        onHoverUpdate("storage_shed", () => { setCursor("pointer"); showStatusMessage("Click to store your harvest.", 0.2); });
        onHoverEnd("storage_shed", () => setCursor("default"));

        // ==========================================
        // MOVEMENT & UPDATE LOOP
        // ==========================================
        onKeyDown("left", () => { if (!isPaused && !inventoryOpen) { player.flipX = false; player.move(-playerSpeed, 0); }});
        onKeyDown("right", () => { if (!isPaused && !inventoryOpen) { player.flipX = true; player.move(playerSpeed, 0); }});

        onUpdate(() => {
            // Nori dinamici
            clouds.forEach(c => {
                c.obj.move(c.speed, 0);
                if (c.obj.pos.x > width() + 100) c.obj.pos.x = -100;
            });

            // Dialog timer
            if(activeDialogue) {
                activeDialogue.elapsed = Math.min(activeDialogue.elapsed + dt(), activeDialogue.duration);
                const visibleChars = Math.floor(activeDialogue.elapsed / 0.026);
                activeDialogue.speech.text = activeDialogue.message.slice(0, visibleChars);
            }

            // Fading status text
            if (statusTimer > 0) {
                statusTimer -= dt();
                if (statusTimer <= 0) statusTimer = 0;
            }
            if (statusTimer <= 0 && statusText.opacity > 0) {
                statusText.opacity -= dt() * 1.5; // fade out effect
            }

            player.pos.x = clamp(player.pos.x, 35, width() - 35);
            player.pos.y = topMovementLimit;
            
            progressSaveElapsed += dt();
            if (progressSaveElapsed >= 0.25) { savePlayerPosition("garden", player.pos.x, player.pos.y); progressSaveElapsed = 0; }

            plots.forEach((plot, index) => {
                if (plot.state === 1 || plot.state === 2) {
                    updatePlotGrowth(plot, index);
                }
                if (plot.state === 1 || plot.state === 2) {
                    plot.clock.opacity = 1; plot.hand.opacity = 1;
                    plot.hand.angle = (plot.growProgress / GROW_TIME) * 360;
                } else {
                    plot.clock.opacity = 0; plot.hand.opacity = 0;
                }
            });
        });

        // Semnul de întoarcere
        add([ rect(15, groundY - returnSignY - 70, { radius: 4 }), pos(returnSignX - 7, returnSignY + 70), color(101, 65, 39), outline(2, rgb(73, 48, 31)), z(10) ]);
        add([ rect(7, groundY - returnSignY - 70, { radius: 3 }), pos(returnSignX - 3, returnSignY + 70), color(143, 94, 55), z(11) ]);
        
        const returnSign = add([ rect(220, 82, { radius: 8 }), pos(returnSignX - 110, returnSignY), color(113, 77, 43), outline(4, rgb(73, 48, 31)), area(), "return_to_maze", z(12) ]);
        returnSign.add([ rect(204, 66, { radius: 5 }), pos(8, 8), color(133, 91, 51), outline(2, rgb(202, 165, 107)), z(13) ]);
        returnSign.add([ text("←", { size: 34 }), pos(34, 40), anchor("center"), color(255, 243, 190), z(14) ]);
        returnSign.add([ text("BACK TO TUNNELS", { size: 14 }), pos(128, 29), anchor("center"), color(255, 255, 255), z(14) ]);
        returnSign.add([ text("CLICK OR WALK PAST", { size: 9 }), pos(128, 51), anchor("center"), color(255, 224, 153), z(14) ]);

        let isReturning = false;
        let spawnProtected = Math.abs(player.pos.x - returnSignX) < 72;

        const returnToTunnels = () => {
            if (isReturning) return;
            isReturning = true;
            if (!beginSceneTransition("game")) {
                isReturning = false;
                return;
            }
            savePlayerPosition("garden", player.pos.x, player.pos.y);
            setActiveScene("game");
            go("loading", "game");
        };
        
        onUpdate(() => {
            if (isReturning || isPaused || inventoryOpen) return;
            const isNearDoor = Math.abs(player.pos.x - returnSignX) < 72;
            if (spawnProtected) {
                if (!isNearDoor || Math.abs(player.pos.x - returnSignX) > 90) spawnProtected = false; 
                return;
            }
            if (isNearDoor) returnToTunnels();
        });
        
        onClick("return_to_maze", () => {
            if (isPaused || inventoryOpen) return;
            spawnProtected = false; 
            returnToTunnels();
        });

        onHoverUpdate("return_to_maze", (button) => { button.color = rgb(63, 116, 72); setCursor("pointer"); showStatusMessage("Head back to the tunnels.", 0.2); });
        onHoverEnd("return_to_maze", (button) => { button.color = rgb(48, 91, 58); setCursor("default"); });

        addNavigationMenu({
            canToggle: () => !activeDialogue,
            onOpenChange: (open) => {
                if (open && inventoryOpen) closeInventory();
                isPaused = open;
            },
            onNavigate: (destination) => {
                setCursor("default");
                if (destination === "restart") {
                    gardenBackpack = { carrot: 0, tomato: 0, potato: 0 };
                    shedStorage = { carrot: 0, tomato: 0, potato: 0 };
                    resetCollectedItems();
                    resetGameSession();
                    go("loading", "game");
                    return;
                }
                savePlayerPosition("garden", player.pos.x, player.pos.y);

                if (destination === "garden") return;
                if (destination === "game") {
                    returnToTunnels();
                    return;
                }
                setActiveScene("garden");
                go("loading", destination === "start" ? "menu" : "story");
            }
        });
    });
}
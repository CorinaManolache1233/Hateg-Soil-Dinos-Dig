import { hasCollectedItem, INVENTORY_ITEMS } from "../../systems/inventory.js";
import { getLitterLayout, isLitterCollected } from "../../systems/game-session.js";

export function createGameWorld(isGamePaused) {
    const SKY_HEIGHT = 500;
    const LAYER_HEIGHT = 1000;
    const WORLD_DEPTH = SKY_HEIGHT + LAYER_HEIGHT * 3;

    // Harta subterană este acum foarte lată fixată la 2800px, 
    // oferind spațiu masiv pentru explorarea labirintului în laterale.
    const WORLD_WIDTH = 2800; 
    const WORLD_CENTER_X = WORLD_WIDTH / 2; 
    const SURFACE_Y = SKY_HEIGHT;
    const TOPSOIL_BOTTOM = SURFACE_Y + LAYER_HEIGHT;
    const SUBSOIL_BOTTOM = TOPSOIL_BOTTOM + LAYER_HEIGHT;

    const PLAYER_HALF_HEIGHT = 120;
    const LIMITA_SUS = SURFACE_Y - PLAYER_HALF_HEIGHT;

    camScale(1);

    // --- BACKGROUND & SKY ---
    // Desenăm cerul pe toată suprafața
    add([ rect(WORLD_WIDTH, SKY_HEIGHT), pos(0, 0), color(115, 195, 245), z(-15) ]);

    const sunX = WORLD_CENTER_X + width() * 0.3;
    const sunY = 140;
    add([ circle(120), pos(sunX, sunY), anchor("center"), color(255, 200, 50), opacity(0.1), z(-14) ]);
    add([ circle(85), pos(sunX, sunY), anchor("center"), color(255, 220, 100), opacity(0.2), z(-13) ]);
    add([ circle(55), pos(sunX, sunY), anchor("center"), color(255, 240, 150), opacity(0.5), z(-12) ]);
    add([ circle(35), pos(sunX, sunY), anchor("center"), color(255, 255, 220), z(-11) ]);

    const skyClouds = [];
    const addCloud = (x, y, cloudScale, speed) => {
    const cloud = add([pos(x, y), scale(cloudScale), z(-10)]);
    cloud.add([circle(45), pos(-35, 12), anchor("center"), color(200, 210, 220)]);
    cloud.add([circle(55), pos(0, 8), anchor("center"), color(200, 210, 220)]);
    cloud.add([circle(45), pos(35, 12), anchor("center"), color(200, 210, 220)]);
    cloud.add([circle(45), pos(-35, 5), anchor("center"), color(255, 255, 255)]);
    cloud.add([circle(55), pos(0, -5), anchor("center"), color(255, 255, 255)]);
    cloud.add([circle(40), pos(35, 5), anchor("center"), color(255, 255, 255)]);
    skyClouds.push({ object: cloud, speed });
    };

    // Norii așezați proporțional cu lățimea ecranului tău
    addCloud(WORLD_CENTER_X - width() * 0.3, 180, 1.1, 13);
    addCloud(WORLD_CENTER_X, 120, 0.8, 19);
    addCloud(WORLD_CENTER_X + width() * 0.35, 250, 0.9, 10);

    const skyBirds = [];
    for (let index = 0; index < 3; index++) {
    const bird = add([
        pos(WORLD_CENTER_X - width() * 0.34 + index * width() * 0.3, 100 + (index % 2) * 90),
        z(-8)
    ]);
    bird.add([
        rect(17, 3), pos(-7, 0), anchor("center"), rotate(-23),
        color(63, 91, 101), opacity(0.8)
    ]);
    bird.add([
        rect(17, 3), pos(7, 0), anchor("center"), rotate(23),
        color(63, 91, 101), opacity(0.8)
    ]);
    skyBirds.push({ object: bird, speed: 28 + index * 8 });
    }

    // --- 1. EARTH LAYERS (Straturile de Sol) ---
    add([ rect(WORLD_WIDTH, LAYER_HEIGHT), pos(0, SURFACE_Y), color(101, 67, 33), z(-10) ]);
    add([ rect(WORLD_WIDTH, 10), pos(0, SURFACE_Y - 10), color(91, 137, 55), z(-7) ]);
    add([ rect(WORLD_WIDTH, 3), pos(0, SURFACE_Y - 3), color(116, 151, 66), z(-6) ]);

    // Iarbă și detalii pământ generate pe toată lățimea
    for (let x = 0; x < WORLD_WIDTH; x += rand(8, 15)) {
    const bladeHeight = rand(10, 22);
    add([ rect(rand(2, 4), bladeHeight), pos(x, SURFACE_Y - bladeHeight / 2 - 2), rotate(rand(-20, 20)), color(54 + rand(0, 30), 120 + rand(0, 40), 39 + rand(0, 20)), z(-5) ]);
    }
    for (let i = 0; i < 90; i++) {
    const fX = rand(10, WORLD_WIDTH - 10);
    const fY = SURFACE_Y - rand(8, 18);
    add([ rect(2, 12), pos(fX, fY), color(70, 140, 50), z(-5) ]);
    const c1 = rand(200, 255), c2 = rand(150, 220), c3 = rand(200, 255);
    add([ circle(4), pos(fX - 4, fY - 2), color(c1, c2, c3), z(-4) ]);
    add([ circle(4), pos(fX + 4, fY - 2), color(c1, c2, c3), z(-4) ]);
    add([ circle(4), pos(fX, fY - 6), color(c1, c2, c3), z(-4) ]);
    add([ circle(4), pos(fX, fY + 2), color(c1, c2, c3), z(-4) ]);
    add([ circle(3), pos(fX, fY - 2), color(255, 240, 100), z(-3) ]);
    }

    for(let i = 0; i < 600; i++) {
    add([ rect(rand(8, 20), rand(3, 6)), pos(rand(0, WORLD_WIDTH), rand(SURFACE_Y + 20, TOPSOIL_BOTTOM)), color(80, 50, 20), z(-9) ]);
    }

    add([ rect(WORLD_WIDTH, LAYER_HEIGHT), pos(0, TOPSOIL_BOTTOM), color(139, 69, 19), z(-10) ]);
    for(let i = 0; i < 600; i++) { add([ circle(rand(3, 8)), pos(rand(0, WORLD_WIDTH), rand(TOPSOIL_BOTTOM, SUBSOIL_BOTTOM)), color(110, 50, 10), z(-9) ]); }

    add([ rect(WORLD_WIDTH, LAYER_HEIGHT), pos(0, SUBSOIL_BOTTOM), color(80, 80, 80), z(-10) ]);
    for(let i = 0; i < 600; i++) { add([ rect(rand(15, 40), rand(15, 40)), pos(rand(0, WORLD_WIDTH), rand(SUBSOIL_BOTTOM, WORLD_DEPTH)), color(60, 60, 60), z(-9) ]); }


    // --- 2. THE MAZE (Rute principale și Fundături) ---
    const corridorWidth = 110;
    const CX = WORLD_CENTER_X;

    const layers = [
    { excavation: [121, 83, 48], edge: [66, 44, 29] }, // Topsoil
    { excavation: [166, 88, 32], edge: [94, 48, 22] }, // Subsoil
    { excavation: [112, 112, 106], edge: [47, 49, 48] } // Bedrock
    ];

    // Drumurile principale de deplasare
    const mainSegments = [
    { x1: CX, y1: SURFACE_Y + corridorWidth / 2 - 14, x2: CX, y2: TOPSOIL_BOTTOM, layer: layers[0], entrance: true }, // Intrarea puțului central, tăiată la nivelul solului
    { x1: WORLD_CENTER_X - width() * 0.34, y1: SURFACE_Y + corridorWidth / 2 - 14, x2: WORLD_CENTER_X - width() * 0.34, y2: SURFACE_Y + 400, layer: layers[0], entrance: true }, // A doua intrare de la suprafață, la stânga intrării centrale
    { x1: 600, y1: SURFACE_Y + 400, x2: 2200, y2: SURFACE_Y + 400, layer: layers[0] }, // Galerie orizontală Topsoil
    { x1: 600, y1: SURFACE_Y + 400, x2: 600, y2: TOPSOIL_BOTTOM, layer: layers[0] }, // Coborâre stânga 1
    { x1: 2200, y1: SURFACE_Y + 400, x2: 2200, y2: TOPSOIL_BOTTOM, layer: layers[0] }, // Coborâre dreapta 1

    { x1: CX, y1: TOPSOIL_BOTTOM, x2: CX, y2: SUBSOIL_BOTTOM, layer: layers[1] }, // Puțul central 2
    { x1: 600, y1: TOPSOIL_BOTTOM, x2: 600, y2: TOPSOIL_BOTTOM + 600, layer: layers[1] }, // Puț stânga 2
    { x1: 2200, y1: TOPSOIL_BOTTOM, x2: 2200, y2: SUBSOIL_BOTTOM, layer: layers[1] }, // Puț dreapta 2
    { x1: 600, y1: TOPSOIL_BOTTOM + 600, x2: CX, y2: TOPSOIL_BOTTOM + 600, layer: layers[1] }, // Galerie intersecție Subsoil
    { x1: CX, y1: TOPSOIL_BOTTOM + 800, x2: 2200, y2: TOPSOIL_BOTTOM + 800, layer: layers[1] }, // Galerie inferioară Subsoil

    { x1: CX, y1: SUBSOIL_BOTTOM, x2: CX, y2: WORLD_DEPTH - 150, layer: layers[2] }, // Puțul central 3
    { x1: 2200, y1: SUBSOIL_BOTTOM, x2: 2200, y2: SUBSOIL_BOTTOM + 400, layer: layers[2] }, // Puț dreapta 3
    { x1: 800, y1: SUBSOIL_BOTTOM + 400, x2: 2200, y2: SUBSOIL_BOTTOM + 400, layer: layers[2] }, // Galerie Bedrock
    ];

    // Drumuri secundare scurte care duc la fosile (Dead Ends)
    const deadEndPaths = [
    { x1: 600, y1: SURFACE_Y + 400, x2: 400, y2: SURFACE_Y + 400, layer: layers[0], fossil: vec2(430, SURFACE_Y + 400) },
    { x1: 2200, y1: SURFACE_Y + 400, x2: 2400, y2: SURFACE_Y + 400, layer: layers[0], fossil: vec2(2370, SURFACE_Y + 400) },
    { x1: CX, y1: SURFACE_Y + 700, x2: CX + 300, y2: SURFACE_Y + 700, layer: layers[0], fossil: vec2(CX + 270, SURFACE_Y + 700) },
    { x1: 1300, y1: SURFACE_Y + 400, x2: 1300, y2: SURFACE_Y + 650, layer: layers[0] },
    { x1: 1750, y1: SURFACE_Y + 400, x2: 1750, y2: SURFACE_Y + 180, layer: layers[0] },

    { x1: 600, y1: TOPSOIL_BOTTOM + 300, x2: 400, y2: TOPSOIL_BOTTOM + 300, layer: layers[1], fossil: vec2(430, TOPSOIL_BOTTOM + 300) },
    { x1: CX, y1: TOPSOIL_BOTTOM + 250, x2: CX - 300, y2: TOPSOIL_BOTTOM + 250, layer: layers[1], fossil: vec2(CX - 270, TOPSOIL_BOTTOM + 250) },
    { x1: 2200, y1: TOPSOIL_BOTTOM + 800, x2: 2400, y2: TOPSOIL_BOTTOM + 800, layer: layers[1], fossil: vec2(2370, TOPSOIL_BOTTOM + 800) },
    { x1: 950, y1: TOPSOIL_BOTTOM + 600, x2: 950, y2: TOPSOIL_BOTTOM + 350, layer: layers[1] },

    { x1: CX, y1: SUBSOIL_BOTTOM + 300, x2: CX + 400, y2: SUBSOIL_BOTTOM + 300, layer: layers[2], fossil: vec2(CX + 370, SUBSOIL_BOTTOM + 300) },
    { x1: 800, y1: SUBSOIL_BOTTOM + 400, x2: 800, y2: SUBSOIL_BOTTOM + 700, layer: layers[2], fossil: vec2(800, SUBSOIL_BOTTOM + 670) },
    { x1: CX, y1: WORLD_DEPTH - 150, x2: CX - 400, y2: WORLD_DEPTH - 150, layer: layers[2], fossil: vec2(CX - 370, WORLD_DEPTH - 150) },
    { x1: 1550, y1: SUBSOIL_BOTTOM + 400, x2: 1550, y2: SUBSOIL_BOTTOM + 650, layer: layers[2] },
    { x1: 2000, y1: SUBSOIL_BOTTOM + 400, x2: 2000, y2: SUBSOIL_BOTTOM + 180, layer: layers[2] }
    ];

    const allSegments = [...mainSegments, ...deadEndPaths];

    const getSegmentBounds = (segment, padding = 0) => ({
    left: Math.min(segment.x1, segment.x2) - corridorWidth / 2 - padding,
    right: Math.max(segment.x1, segment.x2) + corridorWidth / 2 + padding,
    top: Math.min(segment.y1, segment.y2) - corridorWidth / 2 - padding,
    bottom: Math.max(segment.y1, segment.y2) + corridorWidth / 2 + padding
    });

    const drawCorridorLayer = (segment, padding, fillColor, zIndex) => {
    const bounds = getSegmentBounds(segment, padding);
    if (segment.entrance) bounds.top = Math.max(bounds.top, SURFACE_Y);
    add([
        rect(bounds.right - bounds.left, bounds.bottom - bounds.top),
        pos(bounds.left, bounds.top), anchor("topleft"),
        color(...fillColor), z(zIndex)
    ]);
    };

    allSegments.forEach((segment) => drawCorridorLayer(segment, 14, segment.layer.edge, -3));
    allSegments.forEach((segment) => {
    drawCorridorLayer(segment, 0, segment.layer.excavation, -2);

    const isVertical = Math.abs(segment.x2 - segment.x1) < 1;
    if (isVertical) {
        for (let supportY = Math.min(segment.y1, segment.y2) + 150; supportY < Math.max(segment.y1, segment.y2) - 50; supportY += 280) {
            add([ rect(corridorWidth + 12, 10, { radius: 3 }), pos(segment.x1 - corridorWidth / 2 - 6, supportY), color(100, 60, 30), z(-1) ]);
        }
    } else {
        for (let supportX = Math.min(segment.x1, segment.x2) + 180; supportX < Math.max(segment.x1, segment.x2) - 50; supportX += 300) {
            add([ rect(10, corridorWidth + 12, { radius: 3 }), pos(supportX, segment.y1 - corridorWidth / 2 - 6), color(100, 60, 30), z(-1) ]);
        }
    }
    });

    const fossilDiscoveries = [
    {
        itemId: "bone_a",
        message: "Fragment A comes from the upper part of the snout, near the front of the skull. Even a small piece can help palaeontologists understand what Magyarosaurus looked like!"
    },
    {
        itemId: "bone_j",
        message: "This is the ilium, part of the pelvis. It helped support my body and connect my powerful hind legs!"
    },
    {
        itemId: "bone_l",
        message: "This is a tibia, the main bone in the lower leg. It helped carry my weight as I walked!"
    },
    {
        itemId: "skull",
        message: "You found a Magyarosaurus skull! Its shape gives palaeontologists clues about my head and how my ancestors lived."
    }
    ];

    const availablePaths = [...deadEndPaths];
    for (let index = availablePaths.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [availablePaths[index], availablePaths[swapIndex]] = [availablePaths[swapIndex], availablePaths[index]];
    }

    const startSafePosition = { x: WORLD_CENTER_X, y: SURFACE_Y - PLAYER_HALF_HEIGHT };
    const discoveryPositions = [];
    const discoveryObjects = [];
    const discoveryState = { nearby: null };
    const addDiscovery = (itemId, message, positionX, positionY, litterId = null) => {
    const item = INVENTORY_ITEMS[itemId];
    const itemScale = {
        bone_a: 0.24,
        bone_j: 0.2,
        bone_l: 0.2,
        skull: 0.2,
        plastic_bag: 0.23,
        plastic_bottle: 0.23
    }[itemId];
    discoveryPositions.push({ x: positionX, y: positionY });
    const discovery = add([
        sprite(item.sprite),
        scale(itemScale),
        pos(positionX, positionY),
        anchor("center"),
        area({ scale: 0.9 }),
        "discovery",
        { itemId, message, litterId }
    ]);
    discoveryObjects.push(discovery);
    };

    fossilDiscoveries.forEach(({ itemId, message }, index) => {
    if (hasCollectedItem(itemId)) return;
    const path = availablePaths[index];
    const isVertical = Math.abs(path.x2 - path.x1) < 1;
    const pathLength = isVertical
        ? Math.abs(path.y2 - path.y1)
        : Math.abs(path.x2 - path.x1);
    const margin = Math.min(55, pathLength * 0.22);
    const positionAlongPath = rand(margin, pathLength - margin);
    const positionX = isVertical
        ? path.x1
        : path.x1 + Math.sign(path.x2 - path.x1) * positionAlongPath;
    const positionY = isVertical
        ? path.y1 + Math.sign(path.y2 - path.y1) * positionAlongPath
        : path.y1;
    addDiscovery(itemId, message, positionX, positionY);
    });

    const getSpacedPosition = (segments, minDistance, attempts = 500) => {
    for (let attempt = 0; attempt < attempts; attempt++) {
        const segment = segments[Math.floor(Math.random() * segments.length)];
        const isVertical = Math.abs(segment.x2 - segment.x1) < 1;
        const pathLength = isVertical
            ? Math.abs(segment.y2 - segment.y1)
            : Math.abs(segment.x2 - segment.x1);
        const margin = Math.min(110, pathLength * 0.2);
        const positionAlongPath = rand(margin, pathLength - margin);
        const x = isVertical
            ? segment.x1
            : segment.x1 + Math.sign(segment.x2 - segment.x1) * positionAlongPath;
        const y = isVertical
            ? segment.y1 + Math.sign(segment.y2 - segment.y1) * positionAlongPath
            : segment.y1;
        const startDistanceX = startSafePosition.x - x;
        const startDistanceY = startSafePosition.y - y;
        if (startDistanceX * startDistanceX + startDistanceY * startDistanceY < 300 * 300) continue;
        const hasSpace = discoveryPositions.every((point) => {
            const distanceX = point.x - x;
            const distanceY = point.y - y;
            return distanceX * distanceX + distanceY * distanceY >= minDistance * minDistance;
        });

        if (hasSpace) return { x, y };
    }

    return null;
    };

    const litterTypes = [
    {
        itemId: "plastic_bag",
        message: "A plastic bag! I’ll carry it to the recycling bin so it won’t hurt wildlife."
    },
    {
        itemId: "plastic_bottle",
        message: "A discarded plastic bottle! Let’s take it to the bin and keep this place clean."
    }
    ];
    const litterLayout = getLitterLayout(() => {
    const placements = [];
    const undergroundSegments = allSegments.filter((segment) => segment.y1 > SURFACE_Y && segment.y2 > SURFACE_Y);
    for (let index = 0; index < 4; index++) {
        const position = getSpacedPosition(undergroundSegments, 220);
        if (!position) break;
        const litter = litterTypes[index % litterTypes.length];
        placements.push({ ...position, ...litter, litterId: `underground-${index}` });
    }

    const grassPositions = [];
    for (let index = 0; index < 2; index++) {
        let position = null;
        for (let attempt = 0; attempt < 300; attempt++) {
            const candidate = {
                x: rand(WORLD_CENTER_X - width() / 2 + 130, WORLD_CENTER_X + width() / 2 - 130),
                y: SURFACE_Y - rand(12, 24)
    };
            const startDistanceX = startSafePosition.x - candidate.x;
            const startDistanceY = startSafePosition.y - candidate.y;
            const isClearOfStart = startDistanceX * startDistanceX + startDistanceY * startDistanceY >= 300 * 300;
            const isSpaced = isClearOfStart && grassPositions.every((point) => {
                const distanceX = point.x - candidate.x;
                const distanceY = point.y - candidate.y;
                return distanceX * distanceX + distanceY * distanceY >= 240 * 240;
            });
            if (isSpaced) {
                position = candidate;
                break;
            }
        }
        if (!position) break;

        const litter = litterTypes[index % litterTypes.length];
        grassPositions.push(position);
        placements.push({ ...position, ...litter, litterId: `grass-${index}` });
    }

    return placements;
    });

    litterLayout.forEach(({ itemId, message, x, y, litterId }) => {
    if (isLitterCollected(litterId)) return;
    addDiscovery(itemId, message, x, y, litterId);
    });

    const gardenSignX = WORLD_CENTER_X + width() * 0.34;
    const surfaceTreePositions = [];
    for (let attempt = 0; attempt < 600 && surfaceTreePositions.length < 8; attempt++) {
    const treeX = rand(180, WORLD_WIDTH - 180);
    const clearOfLandmarks = Math.abs(treeX - CX) > 150
        && Math.abs(treeX - (WORLD_CENTER_X + 220)) > 115
        && Math.abs(treeX - gardenSignX) > 175;
    const clearOfTrees = surfaceTreePositions.every((existingX) => Math.abs(existingX - treeX) > 280);
    if (!clearOfLandmarks || !clearOfTrees) continue;

    surfaceTreePositions.push(treeX);
    const treeHeight = rand(150, 225);
    const canopyRadius = rand(48, 70);
    const canopyY = SURFACE_Y - treeHeight * 0.82;
    const foliageColor = [
        [59, 119, 58],
        [72, 137, 66],
        [83, 145, 72],
        [64, 126, 76]
    ][Math.floor(rand(0, 4))];

    add([
        rect(rand(22, 32), treeHeight * 0.82),
        pos(treeX, SURFACE_Y - treeHeight * 0.41),
        anchor("center"),
        color(108, 72, 45),
        z(-4)
    ]);
    add([
        rect(10, treeHeight * 0.52),
        pos(treeX - 3, SURFACE_Y - treeHeight * 0.42),
        anchor("center"),
        color(133, 91, 53),
        z(-3)
    ]);
    add([
        rect(38, 11),
        pos(treeX - 19, SURFACE_Y - treeHeight * 0.55),
        rotate(-32),
        color(108, 72, 45),
        z(-4)
    ]);
    add([
        rect(38, 11),
        pos(treeX + 8, SURFACE_Y - treeHeight * 0.63),
        rotate(32),
        color(108, 72, 45),
        z(-4)
    ]);

    const canopyOffsets = [
        { x: -canopyRadius * 0.65, y: 8, scale: 0.78 },
        { x: 0, y: -canopyRadius * 0.24, scale: 1 },
        { x: canopyRadius * 0.66, y: 10, scale: 0.8 },
        { x: -canopyRadius * 0.2, y: canopyRadius * 0.45, scale: 0.72 },
        { x: canopyRadius * 0.45, y: canopyRadius * 0.4, scale: 0.7 }
    ];
    canopyOffsets.forEach((leaf, leafIndex) => {
        add([
            circle(canopyRadius * leaf.scale),
            pos(treeX + leaf.x, canopyY + leaf.y),
            anchor("center"),
            color(
                Math.min(255, foliageColor[0] + leafIndex * 3),
                Math.min(255, foliageColor[1] + leafIndex * 3),
                foliageColor[2]
            ),
            z(-3)
        ]);
    });

    for (let leafIndex = 0; leafIndex < 5; leafIndex++) {
        add([
            circle(rand(5, 9)),
            pos(treeX + rand(-canopyRadius * 0.6, canopyRadius * 0.6), canopyY + rand(-canopyRadius * 0.55, canopyRadius * 0.55)),
            anchor("center"),
            color(139, 170, 89),
            opacity(0.8),
            z(-2)
        ]);
    }
    }

    for (let index = 0; index < 18; index++) {
    const plantX = rand(80, WORLD_WIDTH - 80);
    const plantSize = rand(12, 24);
    add([
        circle(plantSize),
        pos(plantX, SURFACE_Y - 6),
        anchor("center"),
        color(54, 117, 52),
        z(-4)
    ]);
    add([
        circle(plantSize * 0.75),
        pos(plantX + plantSize * 0.8, SURFACE_Y - 4),
        anchor("center"),
        color(72, 137, 60),
        z(-4)
    ]);
    }

    for (let index = 0; index < 20; index++) {
    const stoneX = rand(50, WORLD_WIDTH - 50);
    add([
        rect(rand(28, 46), rand(12, 18), { radius: 7 }),
        pos(stoneX, SURFACE_Y - 5),
        anchor("center"),
        rotate(rand(-14, 14)),
        color(126, 119, 101),
        z(-3)
    ]);
    add([
        rect(rand(12, 22), rand(6, 10), { radius: 4 }),
        pos(stoneX - 4, SURFACE_Y - 8),
        anchor("center"),
        rotate(rand(-14, 14)),
        color(158, 148, 124),
        z(-2)
    ]);
    }

    const isInsideDigNetwork = (x, y) => {
    if (y > WORLD_DEPTH) return false;
    return allSegments.some((segment) => {
        const bounds = getSegmentBounds(segment, -6);
        return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    });
    };
    const isAtGrassLevel = (y) => y <= LIMITA_SUS;
    const isInTunnelOrEntrance = (x, y) => {
    const isInsideSurfaceEntrance = mainSegments.some((segment) => {
        if (!segment.entrance || Math.abs(segment.x1 - segment.x2) >= 1) return false;
        const left = segment.x1 - corridorWidth / 2 + 6;
        const right = segment.x1 + corridorWidth / 2 - 6;
        return x >= left && x <= right && y >= LIMITA_SUS && y <= SURFACE_Y + corridorWidth / 2;
    });
    return isInsideSurfaceEntrance || isInsideDigNetwork(x, y);
    };

    // --- 3. EDUCATIONAL ZONES (PANELS) ---
    const soilZones = [
    { name: "ZONE 1: TOPSOIL", y: SURFACE_Y + 170, accentColor: [100, 200, 100], speech: "This is topsoil—the busy layer! Tiny creatures recycle old leaves here, while roots drink up stored rain. Pretty important for a patch of dirt, huh?" },
    { name: "ZONE 2: SUBSOIL", y: TOPSOIL_BOTTOM + 170, accentColor: [200, 150, 50], speech: "We’re in the subsoil. Rain carries minerals down, and clay holds water like a sponge. These layers can even preserve clues about how the island changed!" },
    { name: "ZONE 3: BEDROCK", y: SUBSOIL_BOTTOM + 170, accentColor: [150, 150, 150], speech: "Whoa, bedrock! This solid rock takes ages to break down into soil. Fossils trapped here can tell stories from millions of years ago!" }
    ];

    soilZones.forEach((zone) => {
    const sign = add([
        rect(320, 90, { radius: 16 }), pos(WORLD_CENTER_X - width() / 2 + 40, zone.y - 45), anchor("topleft"),
        color(25, 28, 32), opacity(0.85), outline(1, rgb(80, 80, 80)), area(), "soil_zone", { zoneData: zone }
    ]);
    sign.add([ rect(4, 50, { radius: 2 }), pos(16, 20), color(...zone.accentColor) ]);
    sign.add([ text(zone.name, { size: 18 }), pos(36, 22), color(255, 255, 255) ]);
    const instructionText = sign.add([ text("Tap to inspect", { size: 14 }), pos(36, 52), color(150, 150, 150) ]);

    sign.onHover(() => {
        if (isGamePaused()) return;
        sign.opacity = 1;
        sign.outline.color = rgb(...zone.accentColor);
        instructionText.color = rgb(...zone.accentColor);
        instructionText.text = "READ FACTS \u2192";
        setCursor("pointer");
    });
    sign.onHoverEnd(() => {
        if (isGamePaused()) return;
        sign.opacity = 0.85;
        sign.outline.color = rgb(80, 80, 80);
        instructionText.color = rgb(150, 150, 150);
        instructionText.text = "Tap to inspect";
        setCursor("default");
    });
    });

    return {
        WORLD_DEPTH,
        WORLD_WIDTH,
        WORLD_CENTER_X,
        SURFACE_Y,
        TOPSOIL_BOTTOM,
        SUBSOIL_BOTTOM,
        PLAYER_HALF_HEIGHT,
        LIMITA_SUS,
        skyClouds,
        skyBirds,
        discoveryObjects,
        discoveryState,
        gardenSignX,
        isAtGrassLevel,
        isInTunnelOrEntrance,
    };

}

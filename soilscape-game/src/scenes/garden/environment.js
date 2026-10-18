export function createGardenEnvironment({ groundY, shedX, shedY }) {
    add([rect(width(), height()), pos(0, 0), color(133, 207, 246), z(-15)]);
    add([circle(74), pos(width() * 0.84, height() * 0.13), anchor("center"), color(255, 226, 117), opacity(0.8), z(-14)]);
    add([circle(94), pos(width() * 0.84, height() * 0.13), anchor("center"), color(255, 226, 117), opacity(0.12), z(-14)]);
    for (let ray = 0; ray < 12; ray++) {
        const angle = ray * 30;
        const radians = angle * Math.PI / 180;
        add([
            rect(4, 18), pos(width() * 0.84 + Math.sin(radians) * 91, height() * 0.13 - Math.cos(radians) * 91), anchor("center"),
            rotate(angle), color(255, 236, 160), opacity(0.7), z(-14)
        ]);
    }

    // Nori dinamici
    const clouds = [];
    for(let i=0; i<5; i++) {
        const cx = rand(0, width());
        const cy = rand(20, height() * 0.25);
        const scaleFactor = rand(0.6, 1.2);
    
        const cloud = add([ pos(cx, cy), scale(scaleFactor), z(-14) ]);
        cloud.add([ rect(76, 18, { radius: 9 }), pos(0, 13), anchor("center"), color(222, 239, 248), opacity(0.55) ]);
        cloud.add([ circle(30), pos(-20, 10), color(255,255,255), opacity(0.8) ]);
        cloud.add([ circle(40), pos(0, 0), color(255,255,255), opacity(0.8) ]);
        cloud.add([ circle(35), pos(25, 5), color(255,255,255), opacity(0.8) ]);
        cloud.add([ circle(22), pos(-4, -12), color(255,255,255), opacity(0.65) ]);
    
        clouds.push({ obj: cloud, speed: rand(10, 25) });
    }
    for (let bird = 0; bird < 4; bird++) {
        const birdX = width() * (0.12 + bird * 0.16);
        const birdY = height() * (0.15 + (bird % 2) * 0.08);
        add([
            rect(15, 2), pos(birdX, birdY), anchor("center"), rotate(-24),
            color(77, 112, 126), opacity(0.7), z(-13)
        ]);
        add([
            rect(15, 2), pos(birdX + 10, birdY - 4), anchor("center"), rotate(24),
            color(77, 112, 126), opacity(0.7), z(-13)
        ]);
    }

    // Munti
    add([polygon([vec2(0, 0), vec2(width() * 0.25, -160), vec2(width() * 0.5, 0)]), pos(0, groundY), color(160, 185, 210), z(-13)]);
    add([polygon([vec2(0, 0), vec2(width() * 0.3, -220), vec2(width() * 0.6, 0)]), pos(width() * 0.3, groundY), color(145, 170, 195), z(-13)]);
    add([polygon([vec2(0, 0), vec2(width() * 0.2, -140), vec2(width() * 0.5, 0)]), pos(width() * 0.6, groundY), color(170, 195, 220), z(-12)]);

    // ==========================================
    // PAMANT SI DETALII DE PEISAJ
    // ==========================================
    add([rect(width(), height() - groundY), pos(0, groundY), color(99, 165, 79), z(-8)]);
    add([rect(width(), 12), pos(0, groundY - 10), color(79, 142, 62), z(-7)]);
    add([rect(width(), height() - groundY - 12), pos(0, groundY + 12), color(115, 79, 52), z(-6)]);
    add([rect(width(), 8), pos(0, groundY + 42), color(133, 93, 59), z(-5)]);
    add([rect(width(), 5), pos(0, groundY + 50), color(101, 68, 46), opacity(0.45), z(-5)]);
    add([rect(width(), 4), pos(0, groundY + 88), color(91, 62, 45), opacity(0.28), z(-5)]);
    for (let patch = 0; patch < 22; patch++) {
        const patchX = rand(0, width());
        const patchY = groundY + rand(5, 13);
        add([
            circle(rand(3, 7)), pos(patchX, patchY), anchor("center"),
            color(patch % 2 ? 112 : 126, patch % 2 ? 177 : 187, patch % 2 ? 85 : 93),
            opacity(0.55), z(-5)
        ]);
    }
    for (let speck = 0; speck < 70; speck++) {
        const speckX = rand(8, width() - 8);
        const speckY = groundY + rand(58, Math.max(59, height() - groundY - 8));
        const speckSize = rand(2, 5);
        add([
            circle(speckSize), pos(speckX, speckY), anchor("center"),
            color(speck % 3 === 0 ? 157 : 87, speck % 3 === 0 ? 119 : 62, speck % 3 === 0 ? 79 : 45),
            opacity(rand(0.18, 0.4)), z(-4)
        ]);
    }
    for (let tuft = 0; tuft < 24; tuft++) {
        const tuftX = rand(10, width() - 10);
        const tuftY = groundY + rand(8, 22);
        add([
            rect(2, rand(5, 10)), pos(tuftX, tuftY), anchor("bot"),
            rotate(rand(-35, 35)), color(57, 125, 49), opacity(0.8), z(-4)
        ]);
    }

    // Flori, iarba si pietricele
    for(let i=0; i<30; i++) {
        const gx = rand(20, width()-20);
        const gy = groundY + rand(5, 45);
        add([rect(3, rand(10,18)), pos(gx, gy), rotate(rand(-20, 20)), anchor("bot"), color(60, 140, 50), z(-5)]);
    }
    for(let i=0; i<15; i++) {
        const fx = rand(20, width()-20);
        const fy = groundY + rand(10, 50);
        add([rect(3, 12), pos(fx, fy), anchor("bot"), color(50, 150, 50), z(-5)]); // tulpina
        add([circle(4), pos(fx, fy - 12), anchor("center"), color(rand(200,255), rand(100,200), rand(200,255)), z(-5)]); // petale
        add([circle(2), pos(fx, fy - 12), anchor("center"), color(255, 255, 0), z(-4)]); // mijloc
    }
    for(let i=0; i<10; i++) {
        const px = rand(20, width()-20);
        const py = groundY + rand(10, 40);
        add([rect(rand(12,20), rand(6,10), {radius: 4}), pos(px, py), anchor("center"), color(140, 140, 130), z(-5)]); // pietricele
    }

    // Copaci detaliati in plan secundar
    for (let index = 0; index < 14; index++) {
        const x = index * width() / 17;
        const treeHeight = 95 + (index % 3) * 24;
        const leafColor = index % 2 ? [63, 137, 65] : [75, 151, 65];
        const barkColor = [95, 65, 40];
    
        // Trunchi si crengi secundare
        add([rect(16, treeHeight * 0.55), pos(x, groundY - treeHeight * 0.27), anchor("center"), color(...barkColor), opacity(0.6), z(-4)]);
        add([rect(18, 5), pos(x + 12, groundY - treeHeight * 0.4), rotate(-35), anchor("center"), color(...barkColor), opacity(0.6), z(-4)]);
        add([rect(14, 4), pos(x - 10, groundY - treeHeight * 0.45), rotate(35), anchor("center"), color(...barkColor), opacity(0.6), z(-4)]);
    
        // Coronament detaliat (din mai multe cercuri)
        add([circle(treeHeight * 0.3), pos(x, groundY - treeHeight * 0.72), anchor("center"), color(...leafColor), opacity(0.6), z(-3)]);
        add([circle(treeHeight * 0.22), pos(x - 15, groundY - treeHeight * 0.65), anchor("center"), color(Math.max(0, leafColor[0]-15), leafColor[1]-15, leafColor[2]-15), opacity(0.6), z(-3)]);
        add([circle(treeHeight * 0.24), pos(x + 15, groundY - treeHeight * 0.68), anchor("center"), color(Math.min(255, leafColor[0]+15), Math.min(255, leafColor[1]+15), leafColor[2]+10), opacity(0.6), z(-3)]);
    }

    // ==========================================
    // STORAGE SHED (CASUTA DE DEPOZITARE)
    // ==========================================
    add([ rect(160, 130), pos(shedX, shedY - 65), anchor("center"), color(139, 90, 43), z(5) ]); 
    add([ polygon([vec2(-95, -130), vec2(95, -130), vec2(0, -200)]), pos(shedX, shedY), color(120, 40, 40), z(6) ]);
    add([ rect(52, 76), pos(shedX, shedY - 38), anchor("center"), color(80, 50, 20), z(6) ]);
    add([ circle(6), pos(shedX + 17, shedY - 38), color(220, 180, 50), z(7) ]);

    add([ rect(110, 32, { radius: 4 }), pos(shedX, shedY - 157), anchor("center"), color(220, 200, 160), z(7) ]);
    add([ text("STORAGE", { size: 18 }), pos(shedX, shedY - 157), anchor("center"), color(60, 40, 20), z(8) ]);

    add([ rect(Math.min(200, width() * 0.3), 210), pos(shedX, shedY - 100), anchor("center"), area(), "storage_shed", z(15), color(0,0,0), opacity(0) ]);

    return { clouds };
}

export function setupLoadingScene() {
    // --- SCENE 3: LOADING ---
    scene("loading", (destination = "game") => {
        if (width() <= 0 || height() <= 0) {
            wait(0.05, () => go("loading", destination));
            return;
        }

        const loadingDuration = 1.85;
        const centerX = width() / 2;
        const groundY = height() * 0.68;
        const routeDetails = {
            menu: {
                eyebrow: "YOUR ADVENTURE CONTINUES",
                title: "BACK TO THE START",
                detail: "The meadow is waiting for you.",
                sky: [132, 194, 207],
                hills: [90, 148, 92],
                grass: [72, 130, 66],
                soil: [163, 119, 77]
            },
            story: {
                eyebrow: "A TALE FROM HATEG GEOPARK",
                title: "TURNING THE PAGES",
                detail: "Discover the world and the story of Magy.",
                sky: [126, 184, 207],
                hills: [86, 139, 104],
                grass: [71, 124, 74],
                soil: [169, 125, 78]
            },
            game: {
                eyebrow: "HATEG UNESCO GLOBAL GEOPARK",
                title: "GETTING READY",
                detail: "Preparing the tunnels beneath the meadow.",
                sky: [111, 164, 171],
                hills: [76, 120, 91],
                grass: [67, 112, 61],
                soil: [153, 111, 73]
            },
            garden: {
                eyebrow: "A LITTLE PATCH OF NATURE",
                title: "GROWING A GARDEN",
                detail: "Getting the seeds and soil ready for Magy.",
                sky: [135, 199, 211],
                hills: [102, 157, 87],
                grass: [79, 143, 68],
                soil: [168, 124, 76]
            }
        };
        const route = routeDetails[destination] || routeDetails.game;
        const titleSize = Math.max(1, Math.min(34, width() * 0.075, height() * 0.085));
        const detailSize = Math.max(1, Math.min(17, width() * 0.042));

        add([
            rect(width(), height()),
            pos(0, 0),
            color(...route.sky),
            fixed(),
            z(-10)
        ]);
        add([
            circle(Math.min(48, width() * 0.1)),
            pos(width() * 0.82, height() * 0.19),
            anchor("center"),
            color(255, 223, 132),
            opacity(0.86),
            fixed(),
            z(-9)
        ]);
        add([
            circle(Math.min(65, width() * 0.135)),
            pos(width() * 0.82, height() * 0.19),
            anchor("center"),
            color(255, 238, 186),
            opacity(0.18),
            fixed(),
            z(-9)
        ]);
        const clouds = [];
        for (let index = 0; index < 3; index++) {
            const cloudX = width() * (0.16 + index * 0.34);
            const cloudY = height() * (0.2 + (index % 2) * 0.1);
            const cloud = add([pos(cloudX, cloudY), fixed(), z(-8)]);
            cloud.add([circle(17), pos(-16, 4), anchor("center"), color(247, 249, 228), opacity(0.72)]);
            cloud.add([circle(22), pos(0, 0), anchor("center"), color(247, 249, 228), opacity(0.8)]);
            cloud.add([circle(16), pos(17, 5), anchor("center"), color(247, 249, 228), opacity(0.72)]);
            clouds.push({ object: cloud, speed: index % 2 === 0 ? 7 : -5 });
        }
        for (let index = 0; index < 4; index++) {
            const hillX = width() * (0.13 + index * 0.25);
            const hillSize = Math.min(width() * 0.21, height() * (0.13 + (index % 2) * 0.025));
            add([
                circle(hillSize),
                pos(hillX, groundY + hillSize * 0.75),
                anchor("center"),
                color(...route.hills),
                fixed(),
                z(-7)
            ]);
        }
        add([
            rect(width(), height() - groundY),
            pos(0, groundY),
            color(...route.soil),
            fixed(),
            z(-6)
        ]);
        add([
            rect(width(), 18),
            pos(0, groundY - 12),
            color(...route.grass),
            fixed(),
            z(-5)
        ]);
        add([
            rect(width(), 4),
            pos(0, groundY + 7),
            color(151, 174, 91),
            fixed(),
            z(-4)
        ]);
        for (let index = 0; index < 36; index++) {
            const rockSize = rand(2, 5);
            add([
                circle(rockSize),
                pos(rand(0, width()), rand(groundY + 24, height() - 8)),
                anchor("center"),
                color(177, 129, 83),
                opacity(rand(0.25, 0.55)),
                fixed(),
                z(-3)
            ]);
        }

        const magyScale = Math.min(0.2, width() / 1500, height() / 900);
        const magy = add([
            sprite("baby_dino"),
            pos(centerX, groundY - 105),
            anchor("center"),
            scale(magyScale),
            fixed(),
            z(1)
        ]);
        const eyebrow = add([
            text(route.eyebrow, { size: Math.max(1, Math.min(13, width() * 0.03)), align: "center" }),
            pos(centerX, height() * 0.12),
            anchor("center"),
            color(255, 241, 196),
            outline(2, rgb(48, 78, 55)),
            fixed(),
            z(2)
        ]);
        const title = add([
            text(route.title, { size: titleSize, align: "center" }),
            pos(centerX, height() * 0.64),
            anchor("center"),
            color(255, 246, 213),
            outline(3, rgb(69, 74, 49)),
            fixed(),
            z(2)
        ]);
        const detail = add([
            text(route.detail, { size: detailSize, align: "center", width: Math.max(1, width() * 0.86) }),
            pos(centerX, height() * 0.71),
            anchor("center"),
            color(255, 249, 225),
            outline(2, rgb(77, 76, 53)),
            fixed(),
            z(2)
        ]);
        onUpdate(() => {
            magy.pos.y = groundY - 105 + Math.sin(time() * 3.2) * 5;
            clouds.forEach(({ object, speed }) => {
                object.pos.x += speed * dt();
                if (object.pos.x > width() + 50) object.pos.x = -50;
                if (object.pos.x < -50) object.pos.x = width() + 50;
            });
            eyebrow.opacity = 0.82 + Math.sin(time() * 1.8) * 0.12;
            title.opacity = 0.94 + Math.sin(time() * 2.2) * 0.06;
            detail.opacity = 0.9 + Math.sin(time() * 1.6) * 0.08;
        });

        const targetScene = destination === "garden" ? "haeg_garden" : destination;
        wait(loadingDuration, () => go(targetScene));
    });
}

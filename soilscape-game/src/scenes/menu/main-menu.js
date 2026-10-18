export function setupMainMenuScene() {
    // --- SCENE 1: MAIN MENU ---
    scene("menu", () => {
        const backgroundScale = Math.max(width() / 1024, height() / 768);

        add([
            sprite("park_background"),
            pos(width() / 2, height() / 2),
            anchor("center"),
            scale(backgroundScale),
            fixed(),
            z(-2)
        ]);

        add([
            sprite("park_text_blur"),
            pos(width() / 2, height() / 2),
            anchor("center"),
            scale(backgroundScale),
            fixed(),
            z(-1)
        ]);

        const isNarrow = width() < 600;
        const centerX = width() / 2;
        const centerY = height() / 2;
        const panelWidth = Math.min(width() * 0.9, 820);
        const layoutScale = Math.min(1, height() / 720);
        const titleSize = Math.min(width() * 0.19, height() * 0.14, 96);
        const subtitleSize = Math.min(width() * 0.052, height() * 0.045, 25);
        const detailSize = Math.min(width() * 0.035, height() * 0.03, 16);

        add([
            text("HAȚEG UNESCO GLOBAL GEOPARK  |  ROMANIA", { size: detailSize, align: "center" }),
            pos(centerX, centerY - 155 * layoutScale),
            anchor("center"),
            color(255, 222, 126),
            outline(2, rgb(62, 48, 28)),
            fixed(),
            z(1)
        ]);

        const addArchedTitle = (label, size, baseY, maxWidth, curveDepth, fillColor, outlineColor, outlineWidth, titleCenterX) => {
            const fittedSize = Math.min(size, maxWidth / (label.length * 0.62));
            const fittedSpacing = fittedSize * 0.62;
            const textWidth = (label.length - 1) * fittedSpacing;
            const arcRadius = Math.max(textWidth, 1) / 2;
            const letters = [];

            [...label].forEach((character, index) => {
                if (character === " ") return;

                const xOffset = (index - (label.length - 1) / 2) * fittedSpacing;
                const normalizedX = arcRadius === 0 ? 0 : xOffset / arcRadius;
                const letter = add([
                    text(character, { size: fittedSize, align: "center" }),
                    pos(titleCenterX + xOffset, baseY + normalizedX * normalizedX * curveDepth),
                    anchor("center"),
                    rotate(Math.atan2(2 * curveDepth * normalizedX, arcRadius) * 180 / Math.PI),
                    scale(1),
                    color(...fillColor),
                    outline(outlineWidth, rgb(...outlineColor)),
                    area(),
                    fixed(),
                    z(2)
                ]);

                letters.push({
                    object: letter,
                    baseX: titleCenterX + xOffset,
                    baseY: baseY + normalizedX * normalizedX * curveDepth,
                    phase: index * 0.48
                });
            });

            onUpdate(() => {
                const smoothStep = 1 - Math.exp(-14 * dt());
                letters.forEach(({ object, baseX, baseY: letterBaseY, phase }) => {
                    const hovered = object.isHovering();
                    const targetScale = hovered ? 1.3 : 1;
                    const idleMotion = Math.sin(time() * 2.2 + phase) * 2;
                    const hoverLift = hovered ? 11 : 0;
                    object.scale = object.scale.lerp(vec2(targetScale), smoothStep);
                    object.pos.x += (baseX - object.pos.x) * smoothStep;
                    object.pos.y += (letterBaseY + idleMotion - hoverLift - object.pos.y) * smoothStep;
                });
            });
            return textWidth;
        };

        addArchedTitle(
            "MAGY'S",
            Math.min(titleSize * 0.78, width() * 0.16, 82),
            centerY - 91 * layoutScale,
            width() * 0.58,
            16 * layoutScale,
            [255, 197, 76],
            [75, 45, 20],
            4,
            centerX
        );
        const ancestorQuestWidth = addArchedTitle(
            "ANCESTOR QUEST",
            Math.min(titleSize * 0.47, width() * 0.09, 52),
            centerY - 28 * layoutScale,
            width() * 0.62,
            12 * layoutScale,
            [255, 242, 205],
            [51, 66, 39],
            3,
            centerX
        );

        const magyScale = isNarrow ? 0.15 : Math.min(0.3, width() / 2800);
        const magyHalfWidth = 206 * magyScale;
        const titleGap = Math.max(12, width() * 0.012);
        const rightMagyX = centerX + ancestorQuestWidth / 2 + magyHalfWidth + titleGap;
        const magyX = Math.min(rightMagyX, width() - magyHalfWidth - titleGap);
        const magyBaseY = centerY - 48 * layoutScale;
        const magy = add([
            sprite("baby_dino"),
            pos(magyX, magyBaseY),
            anchor("center"),
            scale(magyScale),
            rotate(-12),
            fixed(),
            z(1)
        ]);

        onUpdate(() => {
            const motionPhase = time() * 2.2 + 3.36;
            const idleMotion = Math.sin(motionPhase) * 2;
            const smoothStep = 1 - Math.exp(-14 * dt());
            magy.pos.y += (magyBaseY + idleMotion - magy.pos.y) * smoothStep;
            magy.angle += (-12 + Math.sin(motionPhase) * 1.5 - magy.angle) * smoothStep;
        });

        add([
            rect(Math.min(panelWidth * 0.32, 180), 3),
            pos(centerX, centerY + 28 * layoutScale),
            anchor("center"),
            color(220, 202, 133),
            fixed(),
            z(1)
        ]);

        add([
            text("Join Magy, a young Magyarosaurus, on a quest\nto find the bones of her ancestors.", {
                size: subtitleSize,
                align: "center",
                width: isNarrow ? width() * 0.78 : width() * 0.5
            }),
            pos(centerX, centerY + 70 * layoutScale),
            anchor("center"),
            color(255, 255, 237),
            outline(2, rgb(142, 48, 42)),
            fixed(),
            z(1)
        ]);

        const buttonY = centerY + 158 * layoutScale;
        const startButtonWidth = isNarrow ? 190 : 224;
        const startButtonHeight = 58;
        const startButtonShadow = add([
            rect(startButtonWidth, startButtonHeight, { radius: 18 }),
            pos(centerX, buttonY + 4),
            anchor("center"),
            color(35, 70, 42),
            opacity(0.42),
            fixed(),
            z(1)
        ]);
        const startButton = add([
            rect(startButtonWidth, startButtonHeight, { radius: 18 }),
            pos(centerX, buttonY),
            anchor("center"),
            scale(1),
            color(57, 139, 73),
            outline(2, rgb(244, 218, 157)),
            area(),
            fixed(),
            "start_button",
            z(2)
        ]);
        startButton.add([
            text("START", { size: isNarrow ? 27 : 30, align: "center" }),
            anchor("center"),
            color(255, 255, 255)
        ]);
        let isStartHovered = false;

        onUpdate(() => {
            const hoverBlend = 1 - Math.exp(-12 * dt());
            const targetScale = isStartHovered ? 1.025 : 1;
            const targetColor = isStartHovered ? rgb(69, 153, 82) : rgb(57, 139, 73);
            startButton.scale = startButton.scale.lerp(vec2(targetScale), hoverBlend);
            startButton.color = startButton.color.lerp(targetColor, hoverBlend);
            startButtonShadow.pos.y = buttonY + 4 + (isStartHovered ? 0.5 : 0);
        });

        onHover("start_button", () => {
            isStartHovered = true;
        });
        onHoverEnd("start_button", () => {
            isStartHovered = false;
        });

        add([
            text("CLICK TO BEGIN  |  PRESS ENTER", { size: Math.max(11, detailSize - 2), align: "center" }),
            pos(centerX, centerY + 222 * layoutScale),
            anchor("center"),
            color(226, 238, 213),
            fixed(),
            z(1)
        ]);

        const startStory = () => {
            go("loading", "story");
        };

        onClick("start_button", startStory);
        onKeyPress("enter", startStory);
    });
}

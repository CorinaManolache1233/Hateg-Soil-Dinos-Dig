export function setupStoryScene() {
    // --- SCENE 2: STORY ---
    scene("story", () => {
        const slides = [
            {
                title: "A SPECIAL PLACE IN ROMANIA",
                text: "Hațeg Geopark, in Romania, is a real place famous for fossils and stories from Earth's past. Millions of years ago, this region was an island where unusual dwarf dinosaurs lived.",
                image: "prehistoric_island"
            },
            {
                title: "MEET MAGY",
                text: "Meet Magy, a curious young Magyarosaurus. She is small, brave and full of questions about the dinosaurs who came before her.",
                image: "prehistoric_island"
            },
            {
                title: "MAGY'S PROMISE",
                text: "My family's story is hidden beneath this ground! The Romanian archaeologists have been digging all day, and they must be exhausted. I want to help them find the scattered fossil pieces. Will you join me?",
                image: "prehistoric_island"
            },
            {
                title: "THE CLUES ARE BURIED",
                text: "I’ll follow the clues underground. Together, we’ll explore the layers of soil and rock, searching carefully for the fossils my family left behind.",
                image: "prehistoric_island"
            },
            {
                title: "PROTECT THE PAST",
                text: "These fossils are fragile, and so is the world around us. Please help me care for nature while we uncover the past.",
                image: "prehistoric_island"
            },
            {
                title: "YOUR EXPEDITION BEGINS",
                text: "Ready to help? Explore Romania’s Hațeg Geopark with me, find the fossil pieces and help protect this special place!",
                image: "park_background"
            }
        ];

        const isNarrow = width() < 650;
        const centerX = width() / 2;
        const centerY = height() / 2;
        const textWidth = Math.min(width() * 0.84, 920);
        const titleSize = Math.max(26, Math.min(isNarrow ? 34 : 46, width() * 0.065));
        const bodySize = Math.max(19, Math.min(isNarrow ? 22 : 28, width() * 0.038));
        let currentSlide = 0;
        let backgroundObject;
        let backgroundBaseScale = 1;
        let slideElapsed = 0;
        let typingElapsed = 0;
        const titleBaseY = centerY - (isNarrow ? 145 : 125);
        const textBaseY = centerY - (isNarrow ? 78 : 48);
        const titleCharacterDelay = 0.045;
        const bodyCharacterDelay = 0.026;
        const getMagyLayout = (isNarrating) => {
            const magyScale = isNarrating
                ? Math.min(1.72, height() * 0.0022)
                : (isNarrow ? Math.min(0.62, height() * 0.00088) : Math.min(0.78, height() * 0.00105, width() * 0.0007));
            const magyX = isNarrating && !isNarrow
                ? width() * 0.3
                : centerX;
            const magyY = height() - 12 - 205 * magyScale;
            return { x: magyX, y: magyY, scale: magyScale };
        };

        add([
            rect(width(), height()),
            color(12, 25, 23),
            opacity(0.34),
            fixed(),
            z(-2)
        ]);

        const setBackground = (imageName) => {
            if (backgroundObject) destroy(backgroundObject);

            const imageSize = imageName === "park_background"
                ? { width: 1024, height: 768 }
                : { width: 1248, height: 832 };
            backgroundBaseScale = Math.max(width() / imageSize.width, height() / imageSize.height);

            backgroundObject = add([
                sprite(imageName),
                pos(width() / 2, height() / 2),
                anchor("center"),
                scale(backgroundBaseScale),
                fixed(),
                z(-3)
            ]);
        };

        setBackground(slides[0].image);

        const initialMagyLayout = getMagyLayout(false);
        const magy = add([
            sprite("baby_dino"),
            pos(initialMagyLayout.x, initialMagyLayout.y),
            anchor("center"),
            scale(initialMagyLayout.scale),
            opacity(0),
            fixed(),
            z(0)
        ]);
        magy.hidden = currentSlide !== 1;

        const chatPanelWidth = isNarrow ? width() * 0.9 : Math.min(width() * 0.46, 620);
        const chatPanelHeight = isNarrow ? height() * 0.4 : Math.min(height() * 0.6, 450);
        const chatPanelX = isNarrow ? centerX : width() * 0.65;
        const chatPanelY = isNarrow ? height() * 0.34 : centerY + 6;
        const chatRadius = Math.min(96, chatPanelHeight * 0.38);
        const chatShadow = add([
            rect(chatPanelWidth, chatPanelHeight, { radius: chatRadius }),
            pos(chatPanelX + 8, chatPanelY + 10),
            anchor("center"),
            color(14, 25, 21),
            opacity(0),
            fixed(),
            z(-0.5)
        ]);
        const chatThoughtDots = (isNarrow
            ? [
                { x: centerX, y: chatPanelY + chatPanelHeight / 2 + 18, radius: 8 },
                { x: centerX, y: chatPanelY + chatPanelHeight / 2 + 42, radius: 13 },
                { x: centerX, y: chatPanelY + chatPanelHeight / 2 + 72, radius: 19 }
            ]
            : [
                { x: chatPanelX - chatPanelWidth / 2 - 42, y: chatPanelY + 70, radius: 8 },
                { x: chatPanelX - chatPanelWidth / 2 - 27, y: chatPanelY + 47, radius: 13 },
                { x: chatPanelX - chatPanelWidth / 2 - 7, y: chatPanelY + 20, radius: 19 }
            ]).map(({ x, y, radius }) => add([
            circle(radius),
            pos(x, y),
            anchor("center"),
            color(249, 246, 231),
            outline(2, rgb(217, 177, 102)),
            opacity(0),
            fixed(),
            z(1)
        ]));
        const chatPanel = add([
            rect(chatPanelWidth, chatPanelHeight, { radius: chatRadius }),
            pos(chatPanelX, chatPanelY),
            anchor("center"),
            color(249, 246, 231),
            outline(4, rgb(217, 177, 102)),
            opacity(0),
            fixed(),
            z(2)
        ]);
        const chatText = add([
            text("", {
                size: Math.max(21, Math.min(isNarrow ? 25 : 32, width() * 0.042)),
                align: "center",
                width: chatPanelWidth * 0.86,
                font: "cursive"
            }),
            pos(chatPanelX, chatPanelY),
            anchor("center"),
            color(61, 69, 58),
            opacity(0),
            fixed(),
            z(3)
        ]);

        const storyTitle = add([
            text("", { size: titleSize, align: "center", width: textWidth, font: "cursive" }),
            pos(centerX, titleBaseY + 18),
            anchor("center"),
            color(255, 219, 139),
            outline(3, rgb(38, 47, 34)),
            opacity(0),
            fixed(),
            z(1)
        ]);

        const storyText = add([
            text("", { size: bodySize, align: "center", width: textWidth, font: "cursive" }),
            pos(centerX, textBaseY + 18),
            anchor("center"),
            color(245, 247, 226),
            outline(2, rgb(35, 46, 35)),
            opacity(0),
            fixed(),
            z(1)
        ]);

        const controlY = isNarrow ? 30 : 38;
        const arrowX = width() - (isNarrow ? 24 : 32);
        const skipX = arrowX - (isNarrow ? 76 : 92);
        const skipButton = add([
            text("SKIP STORY", { size: isNarrow ? 13 : 15, align: "center" }),
            pos(skipX, controlY),
            anchor("center"),
            color(242, 239, 216),
            area(),
            fixed(),
            "story_skip",
            z(2)
        ]);
        const arrowButton = add([
            text("→", { size: isNarrow ? 26 : 30, align: "center" }),
            pos(arrowX, controlY),
            anchor("center"),
            color(242, 239, 216),
            area(),
            fixed(),
            "story_skip_arrow",
            z(2)
        ]);

        onHover("story_skip", (button) => {
            button.color = rgb(255, 197, 76);
        });
        onHoverEnd("story_skip", (button) => {
            button.color = rgb(242, 239, 216);
        });
        onHover("story_skip_arrow", (button) => {
            button.color = rgb(255, 197, 76);
        });
        onHoverEnd("story_skip_arrow", (button) => {
            button.color = rgb(242, 239, 216);
        });

        const showSlide = () => {
            const slide = slides[currentSlide];
            slideElapsed = 0;
            typingElapsed = 0;
            storyTitle.text = "";
            storyText.text = "";
            storyTitle.opacity = 0;
            storyText.opacity = 0;
            storyTitle.pos.y = titleBaseY + 18;
            storyText.pos.y = textBaseY + 18;
            chatText.text = "";
            const isMagyNarrating = currentSlide >= 2;
            magy.hidden = currentSlide !== 1 && !isMagyNarrating;
            storyTitle.hidden = isMagyNarrating;
            storyText.hidden = isMagyNarrating;
            chatPanel.hidden = !isMagyNarrating;
            chatShadow.hidden = !isMagyNarrating;
            chatThoughtDots.forEach((dot) => {
                dot.hidden = !isMagyNarrating;
            });
            chatText.hidden = !isMagyNarrating;
            setBackground(slide.image);
        };

        const advance = () => {
            const slide = slides[currentSlide];
            const isMagyNarrating = currentSlide >= 2;
            const titleTypingDuration = isMagyNarrating ? 0 : slide.title.length * titleCharacterDelay;
            const bodyTypingDuration = slide.text.length * bodyCharacterDelay;
            if (typingElapsed < titleTypingDuration + bodyTypingDuration) {
                typingElapsed = titleTypingDuration + bodyTypingDuration;
                storyTitle.text = slide.title;
                storyText.text = slide.text;
                chatText.text = slide.text;
                return;
            }

            if (currentSlide === slides.length - 1) {
                go("loading", "game");
                return;
            }
            currentSlide++;
            showSlide();
        };

        const skipStory = () => {
            go("loading", "game");
        };

        showSlide();
        onUpdate(() => {
            slideElapsed += dt();
            typingElapsed += dt();
            const fadeStep = Math.min(1, dt() * 2.5);
            const floatOffset = Math.sin(time() * 1.8) * (isNarrow ? 4 : 7);
            const isMagyNarrating = currentSlide >= 2;
            const targetMagyOpacity = currentSlide === 1 || isMagyNarrating ? 1 : 0;
            const slide = slides[currentSlide];
            const titleTypingDuration = isMagyNarrating ? 0 : slide.title.length * titleCharacterDelay;
            const visibleTitleCharacters = Math.min(
                slide.title.length,
                Math.floor(typingElapsed / titleCharacterDelay)
            );
            const bodyTypingElapsed = Math.max(0, typingElapsed - titleTypingDuration);
            const visibleBodyCharacters = Math.min(
                slide.text.length,
                Math.floor(bodyTypingElapsed / bodyCharacterDelay)
            );
            storyTitle.text = slide.title.slice(0, visibleTitleCharacters);
            storyText.text = slide.text.slice(0, visibleBodyCharacters);
            chatText.text = storyText.text;
            magy.hidden = currentSlide !== 1 && !isMagyNarrating;
            storyTitle.hidden = isMagyNarrating;
            storyText.hidden = isMagyNarrating;
            chatPanel.hidden = !isMagyNarrating;
            chatShadow.hidden = !isMagyNarrating;
            chatThoughtDots.forEach((dot) => {
                dot.hidden = !isMagyNarrating;
            });
            chatText.hidden = !isMagyNarrating;
            magy.opacity += (targetMagyOpacity - magy.opacity) * fadeStep;
            storyTitle.opacity += (1 - storyTitle.opacity) * fadeStep;
            storyText.opacity += (1 - storyText.opacity) * fadeStep;
            const targetChatOpacity = isMagyNarrating ? 1 : 0;
            chatPanel.opacity += (targetChatOpacity - chatPanel.opacity) * fadeStep;
            chatShadow.opacity += ((isMagyNarrating ? 0.28 : 0) - chatShadow.opacity) * fadeStep;
            chatThoughtDots.forEach((dot) => {
                dot.opacity += (targetChatOpacity - dot.opacity) * fadeStep;
            });
            chatText.opacity += (targetChatOpacity - chatText.opacity) * fadeStep;
            storyTitle.pos.y += (titleBaseY - storyTitle.pos.y) * fadeStep;
            storyText.pos.y += (textBaseY - storyText.pos.y) * fadeStep;

            const magyLayout = getMagyLayout(isMagyNarrating);
            const magyFloat = currentSlide === 1 ? floatOffset : 0;
            magy.pos.x += (magyLayout.x - magy.pos.x) * fadeStep;
            magy.pos.y += (magyLayout.y + magyFloat - magy.pos.y) * fadeStep;
            magy.scale = magy.scale.lerp(vec2(magyLayout.scale), fadeStep);

            const slowZoom = 1 + Math.min(slideElapsed / 12, 1) * 0.035;
            backgroundObject.scale = vec2(backgroundBaseScale * slowZoom);
            backgroundObject.pos.x = centerX + Math.sin(slideElapsed * 0.24) * 8;
            backgroundObject.pos.y = centerY + Math.cos(slideElapsed * 0.2) * 5;
        });

        onClick(() => {
            const pointer = mousePos();
            const skipHalfWidth = isNarrow ? 39 : 47;
            const controlHalfHeight = isNarrow ? 20 : 23;
            const inSkipText = Math.abs(pointer.x - skipX) <= skipHalfWidth
                && Math.abs(pointer.y - controlY) <= controlHalfHeight;
            const inSkipArrow = Math.abs(pointer.x - arrowX) <= controlHalfHeight
                && Math.abs(pointer.y - controlY) <= controlHalfHeight;

            if (inSkipText || inSkipArrow) {
                skipStory();
                return;
            }

            advance();
        });
        onKeyPress("enter", advance);
        onKeyPress("space", advance);
        onKeyPress("right", advance);
    });
}

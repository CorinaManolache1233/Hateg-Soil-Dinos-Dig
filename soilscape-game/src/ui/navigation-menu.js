export function addNavigationMenu({ onNavigate, onOpenChange, canToggle = () => true }) {
    const drawerWidth = Math.min(286, width());
    const drawerHeight = height();
    const optionY = Math.min(168, Math.max(132, drawerHeight * 0.3));
    const optionHeight = Math.max(24, Math.min(52, (drawerHeight - optionY - 48 - 32) / 5));
    const optionGap = 8;
    const optionX = 28;
    const optionWidth = drawerWidth - 72;
    let isOpen = false;
    let isPinnedOpen = false;

    const panel = add([
        rect(drawerWidth, drawerHeight),
        pos(0, 0),
        color(244, 242, 226),
        fixed(),
        z(598)
    ]);
    panel.hidden = true;

    const trim = add([
        rect(4, drawerHeight),
        pos(drawerWidth - 4, 0),
        color(112, 157, 98),
        fixed(),
        z(599)
    ]);
    trim.hidden = true;

    const headerAccent = add([
        rect(drawerWidth - 56, 3, { radius: 2 }),
        pos(28, 115),
        color(206, 166, 91),
        fixed(),
        z(600)
    ]);
    headerAccent.hidden = true;

    const heading = add([
        text("EXPLORE WITH MAGY", { size: Math.min(21, drawerWidth * 0.085) }),
        pos(28, 78),
        anchor("left"),
        color(49, 76, 59),
        fixed(),
        z(600)
    ]);
    heading.hidden = true;

    const subheading = add([
        text("Choose where to go next", { size: 14 }),
        pos(28, 98),
        anchor("left"),
        color(119, 126, 105),
        fixed(),
        z(600)
    ]);
    subheading.hidden = true;

    const options = [
        { id: "start", label: "START" },
        { id: "story", label: "STORY" },
        { id: "game", label: "TUNNELS" },
        { id: "garden", label: "GARDEN" },
        { id: "restart", label: "RESTART" }
    ];
    const optionButtons = [];
    options.forEach(({ id, label }, index) => {
        const button = add([
            rect(optionWidth, optionHeight, { radius: 12 }),
            pos(optionX, optionY + index * (optionHeight + optionGap)),
            color(id === "restart" ? rgb(244, 231, 218) : rgb(255, 255, 250)),
            outline(1, id === "restart" ? rgb(220, 187, 161) : rgb(223, 224, 207)),
            area(),
            fixed(),
            `navigation_menu_${id}`,
            z(600)
        ]);
        button.add([
            circle(4),
            pos(20, optionHeight / 2),
            anchor("center"),
            color(id === "restart" ? rgb(193, 117, 77) : rgb(102, 151, 94))
        ]);
        button.add([
            text(label, { size: Math.min(15, optionHeight * 0.4) }),
            pos(36, optionHeight / 2),
            anchor("left"),
            color(id === "restart" ? rgb(142, 87, 61) : rgb(55, 78, 61))
        ]);
        button.hidden = true;
        optionButtons.push(button);

        onClick(`navigation_menu_${id}`, () => {
            if (!isOpen) return;
            isPinnedOpen = false;
            setOpen(false);
            onNavigate(id);
        });
        onHoverUpdate(`navigation_menu_${id}`, (hoveredButton) => {
            if (!isOpen) return;
            hoveredButton.color = id === "restart" ? rgb(238, 211, 188) : rgb(231, 240, 223);
            setCursor("pointer");
        });
        onHoverEnd(`navigation_menu_${id}`, (hoveredButton) => {
            hoveredButton.color = id === "restart" ? rgb(244, 231, 218) : rgb(255, 255, 250);
            setCursor("default");
        });
    });

    const decorations = [];
    for (let index = 0; index < 7; index++) {
        const decorationY = 170 + index * Math.max(42, (drawerHeight - 210) / 7);
        const leaf = add([
            rect(22, 8, { radius: 5 }),
            pos(drawerWidth - 18, decorationY),
            rotate(index % 2 ? -32 : 32),
            color(124, 165, 104),
            fixed(),
            z(600)
        ]);
        leaf.hidden = true;
        decorations.push(leaf);
        const flower = add([
            circle(3),
            pos(drawerWidth - 24, decorationY - 5),
            anchor("center"),
            color(223, 175, 105),
            fixed(),
            z(600)
        ]);
        flower.hidden = true;
        decorations.push(flower);
    }

    const menuButton = add([
        rect(132, 42, { radius: 12 }),
        pos(16, 16),
        color(35, 70, 52),
        outline(1, rgb(221, 211, 174)),
        area(),
        fixed(),
        "navigation_menu_toggle",
        z(601)
    ]);
    menuButton.add([text("MENU  \u2630", { size: 16 }), pos(66, 21), anchor("center"), color(255, 255, 255)]);

    const setOpen = (open) => {
        isOpen = open;
        panel.hidden = !open;
        trim.hidden = !open;
        headerAccent.hidden = !open;
        heading.hidden = !open;
        subheading.hidden = !open;
        optionButtons.forEach((button) => { button.hidden = !open; });
        decorations.forEach((decoration) => { decoration.hidden = !open; });
        onOpenChange(open);
    };

    onClick("navigation_menu_toggle", () => {
        if (!canToggle()) return;
        isPinnedOpen = !isPinnedOpen;
        if (isPinnedOpen) setOpen(true);
    });
    onHoverUpdate("navigation_menu_toggle", (button) => {
        if (!isOpen && canToggle()) setOpen(true);
        button.color = rgb(49, 89, 64);
        setCursor("pointer");
    });
    onHoverEnd("navigation_menu_toggle", (button) => {
        button.color = rgb(35, 70, 52);
    });

    onUpdate(() => {
        if (!isOpen || isPinnedOpen) return;
        const pointer = mousePos();
        if (pointer.x < 0 || pointer.x > drawerWidth || pointer.y < 0 || pointer.y > drawerHeight) {
            setOpen(false);
        }
    });
}

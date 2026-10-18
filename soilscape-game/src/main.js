import kaboom from "kaboom";
import { setupMenu } from "./scenes/menu/index.js";
import { setupJoc } from "./scenes/game/scene.js";
import { setupGradina } from "./scenes/garden/scene.js";
import { getSavedProgress } from "./systems/game-session.js";

// Fără lățime și înălțime fixă -> Fullscreen automat
kaboom({
    background: [135, 206, 235], // Cerul de la suprafață
    font: "sans-serif",
});

loadSprite("baby_dino", "/baby_dino.png");
loadSprite("park_background", "/poze_poveste/parcu.jpg");
loadSprite("park_text_blur", "/poze_poveste/parcu-text-blur.png");
loadSprite("prehistoric_island", "/poze_poveste/2D_vector_game_art_of_ancient_Haeg_island_prehistoric_landsc.png");
loadSprite("bone", "/os_dinozaur.png");
loadSprite("eggs", "/oua_dinozaur.png");
loadSprite("bone_a", "/oase/a.png");
loadSprite("bone_j", "/oase/j.png");
loadSprite("bone_l", "/oase/L.png");
loadSprite("plastic_bag", "/punga.png");
loadSprite("plastic_bottle", "/sticla.png");

setupMenu();
setupJoc();
setupGradina();

const savedProgress = getSavedProgress();
const savedScene = savedProgress.activeScene === "garden" || savedProgress.activeScene === "game"
    ? savedProgress.activeScene
    : null;
if (savedScene) {
    go("loading", savedScene);
} else {
    go("menu");
}
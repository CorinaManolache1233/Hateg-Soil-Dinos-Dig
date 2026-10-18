import { setupMainMenuScene } from "./main-menu.js";
import { setupStoryScene } from "./story.js";
import { setupLoadingScene } from "./loading.js";

export function setupMenu() {
    setupMainMenuScene();
    setupStoryScene();
    setupLoadingScene();
}

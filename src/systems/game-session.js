const STORAGE_KEY = "magy-game-session";
const GARDEN_STORAGE_KEY = "magy-garden-progress";
const expandGardenPlotValues = (values, emptyValue) => {
    if (values.length === 9) return [...values];
    if (values.length === 7) {
        return [
            values[0], values[1], values[2],
            values[3], emptyValue, emptyValue,
            values[4], values[5], values[6]
        ];
    }
    if (values.length === 3) {
        return [
            values[0], emptyValue, emptyValue,
            values[1], emptyValue, emptyValue,
            values[2], emptyValue, emptyValue
        ];
    }
    return Array(9).fill(emptyValue);
};

const readSavedSession = () => {
    if (typeof sessionStorage === "undefined") return null;
    const serializedSession = sessionStorage.getItem(STORAGE_KEY);
    if (!serializedSession) return null;

    try {
        const savedSession = JSON.parse(serializedSession);
        if (!savedSession || savedSession.version !== 1) return null;
        return savedSession;
    } catch (error) {
        console.warn("Could not restore the saved game session.", error);
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

const savedSession = readSavedSession();
const readSavedGardenProgress = () => {
    if (typeof localStorage === "undefined") return null;
    const serializedProgress = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (!serializedProgress) return null;

    try {
        const progress = JSON.parse(serializedProgress);
        if (!progress
            || !Array.isArray(progress.states)
            || (progress.states.length !== 7 && progress.states.length !== 9)
            || !progress.states.every((state) => Number.isInteger(state) && state >= 0 && state <= 3)
            || !Array.isArray(progress.plantTimes)
            || progress.plantTimes.length !== progress.states.length
            || !progress.plantTimes.every((time) => time === null || (Number.isFinite(time) && time >= 0))) {
            throw new Error("Saved garden progress has an invalid format.");
        }
        return {
            states: expandGardenPlotValues(progress.states, 0),
            plantTimes: expandGardenPlotValues(progress.plantTimes, null)
        };
    } catch (error) {
        console.warn("Could not restore saved garden progress.", error);
        localStorage.removeItem(GARDEN_STORAGE_KEY);
        return null;
    }
};
const savedGardenProgress = readSavedGardenProgress();
let litterLayout = Array.isArray(savedSession?.litterLayout) ? savedSession.litterLayout : null;
const collectedLitterIds = new Set(
    Array.isArray(savedSession?.collectedLitterIds) ? savedSession.collectedLitterIds : []
);
let activeScene = savedSession?.activeScene === "game" || savedSession?.activeScene === "garden"
    ? savedSession.activeScene
    : null;
let pendingSceneTransition = null;
const isSavedPosition = (position) => position
    && Number.isFinite(position.x)
    && Number.isFinite(position.y);
const positions = savedSession?.positions && typeof savedSession.positions === "object"
    ? {
        game: isSavedPosition(savedSession.positions.game) ? savedSession.positions.game : null,
        garden: isSavedPosition(savedSession.positions.garden) ? savedSession.positions.garden : null
    }
    : {};
const savedGardenPlotStates = savedSession?.gardenPlotStates;
const isValidGardenPlotStates = Array.isArray(savedGardenPlotStates)
    && (savedGardenPlotStates.length === 3 || savedGardenPlotStates.length === 7 || savedGardenPlotStates.length === 9)
    && savedGardenPlotStates.every((state) => Number.isInteger(state) && state >= 0 && state <= 3);
const savedGardenPlotPlantTimes = savedSession?.gardenPlotPlantTimes;
const isValidGardenPlotPlantTimes = Array.isArray(savedGardenPlotPlantTimes)
    && (savedGardenPlotPlantTimes.length === 7 || savedGardenPlotPlantTimes.length === 9)
    && savedGardenPlotPlantTimes.every((time) => time === null || (Number.isFinite(time) && time >= 0));
let gardenPlotStates = savedGardenProgress
    ? [...savedGardenProgress.states]
    : isValidGardenPlotStates
        ? expandGardenPlotValues(savedGardenPlotStates, 0)
        : Array(9).fill(0);
let gardenPlotPlantTimes = savedGardenProgress
    ? [...savedGardenProgress.plantTimes]
    : isValidGardenPlotPlantTimes
        ? expandGardenPlotValues(savedGardenPlotPlantTimes, null)
        : Array(9).fill(null);

const persistSession = () => {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        litterLayout,
        collectedLitterIds: [...collectedLitterIds],
        activeScene,
        positions,
        gardenPlotStates,
        gardenPlotPlantTimes
    }));
};

const persistGardenProgress = () => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify({
        states: gardenPlotStates,
        plantTimes: gardenPlotPlantTimes
    }));
};

export function getSavedProgress() {
    return {
        activeScene,
        positions: {
            game: isSavedPosition(positions.game) ? { ...positions.game } : null,
            garden: isSavedPosition(positions.garden) ? { ...positions.garden } : null
        }
    };
}

export function savePlayerPosition(sceneName, x, y) {
    if ((sceneName !== "game" && sceneName !== "garden") || !Number.isFinite(x) || !Number.isFinite(y)) return;
    positions[sceneName] = { x, y };
    activeScene = sceneName;
    persistSession();
}

export function setActiveScene(sceneName) {
    if (sceneName !== "game" && sceneName !== "garden") return;
    activeScene = sceneName;
    persistSession();
}

export function beginSceneTransition(sceneName) {
    if ((sceneName !== "game" && sceneName !== "garden") || pendingSceneTransition !== null) return false;
    pendingSceneTransition = sceneName;
    return true;
}

export function completeSceneTransition(sceneName) {
    if (pendingSceneTransition === sceneName) pendingSceneTransition = null;
}

export function getGardenPlotStates() {
    return [...gardenPlotStates];
}

export function getGardenPlotPlantTimes() {
    return [...gardenPlotPlantTimes];
}

export function saveGardenPlotStates(states, plantTimes = gardenPlotPlantTimes) {
    if (!Array.isArray(states) || states.length !== 9
        || !states.every((state) => Number.isInteger(state) && state >= 0 && state <= 3)) {
        throw new Error("Garden plot states must contain nine values from 0 to 3.");
    }
    if (!Array.isArray(plantTimes) || plantTimes.length !== 9
        || !plantTimes.every((time) => time === null || (Number.isFinite(time) && time >= 0))) {
        throw new Error("Garden plot plant times must contain nine timestamps or null values.");
    }
    gardenPlotStates = [...states];
    gardenPlotPlantTimes = [...plantTimes];
    persistSession();
    persistGardenProgress();
}

export function getLitterLayout(createLayout) {
    if (litterLayout === null) {
        litterLayout = createLayout();
        persistSession();
    }
    return litterLayout;
}

export function collectLitter(litterId) {
    collectedLitterIds.add(litterId);
    persistSession();
}

export function isLitterCollected(litterId) {
    return collectedLitterIds.has(litterId);
}

export function resetGameSession() {
    litterLayout = null;
    collectedLitterIds.clear();
    activeScene = null;
    delete positions.game;
    delete positions.garden;
    gardenPlotStates = Array(9).fill(0);
    gardenPlotPlantTimes = Array(9).fill(null);
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
    if (typeof localStorage !== "undefined") localStorage.removeItem(GARDEN_STORAGE_KEY);
}

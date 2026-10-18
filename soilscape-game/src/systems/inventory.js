import { INVENTORY_ITEMS } from "../data/inventory-items.js";

export { INVENTORY_ITEMS } from "../data/inventory-items.js";

const STORAGE_KEY = "magy-inventory";
const readSavedItemIds = () => {
    if (typeof sessionStorage === "undefined") return [];
    const serializedItems = sessionStorage.getItem(STORAGE_KEY);
    if (!serializedItems) return [];

    try {
        const savedItems = JSON.parse(serializedItems);
        return Array.isArray(savedItems)
            ? savedItems.filter((itemId) => Object.hasOwn(INVENTORY_ITEMS, itemId))
            : [];
    } catch (error) {
        console.warn("Could not restore the saved inventory.", error);
        sessionStorage.removeItem(STORAGE_KEY);
        return [];
    }
};
let collectedItemIds = readSavedItemIds();

const persistInventory = () => {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(collectedItemIds));
    }
};

export function resetCollectedItems() {
    collectedItemIds = [];
    persistInventory();
}

export function getCollectedItemIds() {
    return [...collectedItemIds];
}

export function hasCollectedItem(itemId) {
    return collectedItemIds.includes(itemId);
}

export function addCollectedItem(itemId) {
    if (!(itemId in INVENTORY_ITEMS)) {
        throw new Error(`Unknown inventory item: ${itemId}`);
    }

    if (!itemId.startsWith("plastic_") && collectedItemIds.includes(itemId)) return false;

    collectedItemIds.push(itemId);
    persistInventory();
    return true;
}

export function removeCollectedItem(itemId) {
    const itemIndex = collectedItemIds.indexOf(itemId);
    if (itemIndex < 0) return false;

    collectedItemIds.splice(itemIndex, 1);
    persistInventory();
    return true;
}

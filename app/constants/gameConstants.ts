// Game Constants
export const BASE_TAP_INTERVAL = 1000; // ms
export const BASE_TAP_AMOUNT = 1; // beer per tick
export const BASE_SELL_INTERVAL = 4000; // ms
export const BASE_SELL_BATCH = 4; // glasses per sale
export const GLASS_CAPACITY = 20; // beer units per glass

// Stool positions for customers (percentage from left)
export const STOOL_POSITIONS = [15, 29, 43, 57, 71, 85] as const;

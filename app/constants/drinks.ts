import type { Drink } from "../types";

export const initialDrinks: Drink[] = [
  {
    type: "bier",
    name: "Bier",
    basePrice: 4,
    productionTime: 1000,
    capacity: 20,
    unlocked: true,
    level: 0
  },
  {
    type: "wijn",
    name: "Wijn",
    basePrice: 8,
    productionTime: 1500,
    capacity: 15,
    unlocked: false,
    level: 0
  },
  {
    type: "cocktail",
    name: "Cocktail",
    basePrice: 12,
    productionTime: 2000,
    capacity: 10,
    unlocked: false,
    level: 0
  },
  {
    type: "whiskey",
    name: "Whiskey",
    basePrice: 15,
    productionTime: 1200,
    capacity: 8,
    unlocked: false,
    level: 0
  },
  {
    type: "champagne",
    name: "Champagne",
    basePrice: 25,
    productionTime: 2500,
    capacity: 12,
    unlocked: false,
    level: 0
  }
];

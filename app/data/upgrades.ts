import type { Upgrade } from "../types";

export const initialUpgrades: Upgrade[] = [
  {
    id: "tap_speed",
    name: "Faster Tap",
    description: "Reduces time between automatic beer ticks.",
    baseCost: 20,
    costMultiplier: 1.35,
    level: 0,
    effect: 0.06,
    category: "TAP"
  },
  {
    id: "tap_amount",
    name: "Larger Glasses",
    description: "Increases amount of beer per tick.",
    baseCost: 35,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.25,
    category: "TAP"
  },
  {
    id: "sell_price",
    name: "Happy Hour Marketing",
    description: "Each glass sells for more money.",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.2,
    category: "PRICE"
  },
  {
    id: "auto_seller",
    name: "Bar Staff",
    description: "Automatically sells beer while you're AFK. ESSENTIAL for idle gameplay.",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AUTOMATIC"
  },
  {
    id: "premium_bier",
    name: "Premium Craft Beer",
    description: "Glasses yield more profit directly.",
    baseCost: 120,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.35,
    category: "PRICE"
  },
  {
    id: "staff_training",
    name: "Team Coaching",
    description: "Increases your team's morale in the long term.",
    baseCost: 90,
    costMultiplier: 1.4,
    level: 0,
    effect: 1.5,
    category: "MORAL"
  },
  {
    id: "wine_cellar",
    name: "Wine Cellar",
    description: "Unlock serving wine. More expensive, but customers pay more.",
    baseCost: 200,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.3,
    category: "DRINK"
  },
  {
    id: "cocktail_bar",
    name: "Cocktail Bar",
    description: "Start serving cocktails. Complex, but very profitable.",
    baseCost: 500,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.4,
    category: "DRINK"
  },
  {
    id: "whiskey_collection",
    name: "Whiskey Collection",
    description: "Premium whiskeys. For true connoisseurs... and their wallets.",
    baseCost: 800,
    costMultiplier: 1.55,
    level: 0,
    effect: 0.5,
    category: "DRINK"
  },
  {
    id: "champagne_service",
    name: "Champagne Service",
    description: "The crème de la crème. For the elite... or those who think they are.",
    baseCost: 1500,
    costMultiplier: 1.7,
    level: 0,
    effect: 0.6,
    category: "DRINK"
  },
  {
    id: "bar_ambiance",
    name: "Bar Ambiance",
    description: "Better atmosphere attracts more customers. Or maybe just better customers.",
    baseCost: 300,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AMBIANCE"
  },
  {
    id: "live_music",
    name: "Live Music",
    description: "A band attracts customers. Or scares them away. Who knows.",
    baseCost: 600,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.35,
    category: "AMBIANCE"
  },
  {
    id: "loyalty_program",
    name: "Loyalty Program",
    description: "Customers come back more often. Or they stay longer. Both are profit.",
    baseCost: 400,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.3,
    category: "MARKETING"
  },
  {
    id: "social_media",
    name: "Social Media Marketing",
    description: "Instagram, TikTok, whatever. As long as it makes money.",
    baseCost: 250,
    costMultiplier: 1.35,
    level: 0,
    effect: 0.2,
    category: "MARKETING"
  },
  {
    id: "bar_expansion",
    name: "Bar Expansion",
    description: "More space = more customers = more money. Math.",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.4,
    category: "TAP"
  },
  {
    id: "master_bartender",
    name: "Master Bartender",
    description: "A real professional. Expensive, but he makes perfect drinks.",
    baseCost: 1200,
    costMultiplier: 1.65,
    level: 0,
    effect: 0.45,
    category: "AUTOMATIC"
  },
  {
    id: "vip_section",
    name: "VIP Section",
    description: "For the rich. Or those who think they're rich. Both pay well.",
    baseCost: 2000,
    costMultiplier: 1.75,
    level: 0,
    effect: 0.5,
    category: "PRICE"
  },
  {
    id: "late_night_hours",
    name: "Late Night Hours",
    description: "Open until late. More time = more money. Or more problems. Probably both.",
    baseCost: 700,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.3,
    category: "AUTOMATIC"
  },
  {
    id: "auto_customer_service",
    name: "Automatic Customer Service",
    description: "Your staff handles customers automatically. Fully idle!",
    baseCost: 150,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.2,
    category: "AUTOMATIC"
  },
  {
    id: "smart_inventory",
    name: "Smart Inventory",
    description: "Automatically selects the best drink for maximum profit.",
    baseCost: 300,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AUTOMATIC"
  },
  {
    id: "passive_income",
    name: "Passive Income",
    description: "Money earns itself. Literally. Idle perfection.",
    baseCost: 500,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.15,
    category: "AUTOMATIC"
  },
  {
    id: "auto_upgrade",
    name: "Automatic Upgrades",
    description: "Automatically buys upgrades when you can afford them. Fully AFK!",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.1,
    category: "AUTOMATIC"
  }
];


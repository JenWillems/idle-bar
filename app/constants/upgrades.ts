import type { Upgrade } from "../types";

export const initialUpgrades: Upgrade[] = [
  {
    id: "tap_speed",
    name: "Faster Production",
    description: "Improve production efficiency with better equipment. More beer, faster. More beer = more money. Simple.",
    baseCost: 20,
    costMultiplier: 1.35,
    level: 0,
    effect: 0.06,
    category: "BUSINESS"
  },
  {
    id: "tap_amount",
    name: "Larger Batches",
    description: "Increase production capacity per cycle. Bigger batches = more profit. It's simple math.",
    baseCost: 35,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.25,
    category: "BUSINESS"
  },
  {
    id: "auto_seller",
    name: "Automated Sales",
    description: "Hire staff to handle sales automatically. Essential for idle gameplay. They work while you sleep. Money flows in 24/7.",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "BUSINESS"
  },
  {
    id: "bar_expansion",
    name: "Bar Expansion",
    description: "Expand your bar to accommodate more customers. More space = more people = more money. Basic economics.",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.4,
    category: "BUSINESS"
  },
  {
    id: "auto_upgrade",
    name: "Automated Management",
    description: "Let your management system handle upgrades automatically. Set it and forget it. The system buys upgrades, you count money.",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.1,
    category: "BUSINESS"
  },
  {
    id: "sell_price",
    name: "Price Gouging",
    description: "Charge customers more because you can. They'll pay anyway. What are they gonna do, go to the bar next door? (There is no bar next door. You own the whole street.)",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.2,
    category: "EVIL"
  },
  {
    id: "premium_bier",
    name: "Overpriced Beer",
    description: "Call it 'premium' and charge double. Most won't notice the difference. It's the same beer, but now it has a fancy label and costs €8 instead of €4. Genius!",
    baseCost: 120,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.35,
    category: "EVIL"
  },
  {
    id: "vip_section",
    name: "Exclusive VIP Area",
    description: "Create an elitist section that excludes regular customers. Make them feel special while you charge them triple. They'll pay for the privilege of feeling superior.",
    baseCost: 2000,
    costMultiplier: 1.75,
    level: 0,
    effect: 0.5,
    category: "EVIL"
  },
  {
    id: "late_night_hours",
    name: "Exploit Late Night Crowd",
    description: "Stay open late to take advantage of drunk customers who don't check prices. At 2 AM, €10 for a beer seems reasonable. (It's not reasonable, but they're too drunk to notice.)",
    baseCost: 700,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.3,
    category: "EVIL"
  },
  {
    id: "watered_down",
    name: "Water Down Drinks",
    description: "Dilute the alcohol content. Customers won't notice until they're too drunk to care. More profit per bottle, less alcohol per customer. Win-win! (For you, not them.)",
    baseCost: 80,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.3,
    category: "EVIL"
  },
  {
    id: "hidden_fees",
    name: "Hidden Service Charges",
    description: "Add mysterious 'service fees' and 'convenience charges' to every bill. Most customers won't question it. Those who do? Well, they already paid.",
    baseCost: 150,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.2,
    category: "EVIL"
  },
  {
    id: "tip_stealing",
    name: "Tip Redistribution",
    description: "Redirect customer tips to your own pocket. The staff gets minimum wage, you get the tips. It's not stealing if it's 'company policy'.",
    baseCost: 200,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "EVIL"
  },
  {
    id: "staff_training",
    name: "Team Coaching",
    description: "Invest in your staff's wellbeing. Happy employees create a better atmosphere. They work harder, stay longer, and actually care. Long-term investment that pays off.",
    baseCost: 200,
    costMultiplier: 1.5,
    level: 0,
    effect: 1.5,
    category: "GOOD"
  },
  {
    id: "quality_ingredients",
    name: "Premium Ingredients",
    description: "Use real, quality ingredients instead of the cheap stuff. Customers notice the difference and are willing to pay more. Takes time to build reputation, but worth it.",
    baseCost: 400,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.3,
    category: "GOOD"
  },
  {
    id: "fair_wages",
    name: "Fair Wages",
    description: "Pay your staff a living wage. They'll be more loyal, work harder, and provide better service. Expensive upfront, but reduces turnover and improves everything long-term.",
    baseCost: 600,
    costMultiplier: 1.65,
    level: 0,
    effect: 0.25,
    category: "GOOD"
  },
  {
    id: "customer_loyalty",
    name: "Genuine Loyalty Program",
    description: "Build real relationships with customers. They'll return more often, recommend you to friends, and pay premium prices because they trust you. Slow start, huge payoff.",
    baseCost: 500,
    costMultiplier: 1.55,
    level: 0,
    effect: 0.35,
    category: "GOOD"
  },
  {
    id: "premium_service",
    name: "Exceptional Service",
    description: "Train staff to provide truly excellent service. Customers remember great experiences and come back. Word spreads. Expensive to maintain, but builds a reputation that lasts.",
    baseCost: 800,
    costMultiplier: 1.7,
    level: 0,
    effect: 0.4,
    category: "GOOD"
  },
  {
    id: "sustainable_practices",
    name: "Sustainable Operations",
    description: "Invest in eco-friendly practices and local sourcing. Reduces long-term costs, attracts conscious customers, and builds community trust. Slow ROI, but sustainable profits.",
    baseCost: 700,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.2,
    category: "GOOD"
  },
  {
    id: "community_support",
    name: "Community Investment",
    description: "Support local events, sponsor teams, give back to the community. People remember who supports them. Builds lasting goodwill that translates to steady, loyal customers.",
    baseCost: 900,
    costMultiplier: 1.75,
    level: 0,
    effect: 0.3,
    category: "GOOD"
  },
  {
    id: "wine_cellar",
    name: "Wine Cellar",
    description: "Install a proper wine cellar to serve quality wines. Unlocks wine production.",
    baseCost: 500,
    costMultiplier: 1.5,
    level: 0,
    maxLevel: 1,
    effect: 0.2,
    category: "BUSINESS"
  },
  {
    id: "cocktail_bar",
    name: "Cocktail Bar",
    description: "Set up a professional cocktail bar with all the tools. Unlocks cocktail production.",
    baseCost: 800,
    costMultiplier: 1.6,
    level: 0,
    maxLevel: 1,
    effect: 0.25,
    category: "BUSINESS"
  },
  {
    id: "whiskey_collection",
    name: "Whiskey Collection",
    description: "Curate a premium whiskey selection. Unlocks whiskey production.",
    baseCost: 1200,
    costMultiplier: 1.65,
    level: 0,
    maxLevel: 1,
    effect: 0.3,
    category: "BUSINESS"
  },
  {
    id: "champagne_service",
    name: "Champagne Service",
    description: "Add luxury champagne service for special occasions. Unlocks champagne production.",
    baseCost: 2000,
    costMultiplier: 1.7,
    level: 0,
    maxLevel: 1,
    effect: 0.35,
    category: "BUSINESS"
  }
];

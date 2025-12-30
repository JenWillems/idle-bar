export type UpgradeId =
  | "tap_speed"
  | "tap_amount"
  | "auto_seller"
  | "bar_expansion"
  | "auto_upgrade"
  | "sell_price"
  | "watered_down"
  | "hidden_fees"
  | "tip_stealing"
  | "tax_evasion"
  | "staff_training"
  | "quality_ingredients"
  | "fair_wages"
  | "sustainable_practices"
  | "wine_cellar"
  | "cocktail_bar"
  | "whiskey_collection"
  | "champagne_service";

export type Upgrade = {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel?: number;
  effect: number;
  category: "GOOD" | "EVIL" | "BUSINESS";
};

export type LogEntry = {
  id: number;
  message: string;
};

export type DrinkType = "bier" | "wijn" | "cocktail" | "whiskey" | "champagne";

export type Drink = {
  type: DrinkType;
  name: string;
  basePrice: number;
  productionTime: number;
  capacity: number;
  unlocked: boolean;
  level: number;
};

export type CustomerOpportunity = "order" | "tip" | "special" | "complaint" | "moral_dilemma" | null;

export type CustomerQuest = {
  customerId: string;
  customerName: string;
  customerSprite: string;
  title: string;
  description: string;
  choices: {
    text: string;
    moral: number;
    money?: number;
    beer?: number;
    consequence?: string;
  }[];
  type: "order" | "tip" | "special" | "complaint" | "dilemma";
};

export type SkeletonPersonality = "deco" | "evil" | "flower" | "rebel" | "smoking" | "witch";

export type Customer = {
  id: string;
  name: string;
  x: number;
  y: number;
  seatIndex: number | null;
  sprite: string;
  personality: SkeletonPersonality;
  opportunity: CustomerOpportunity;
  opportunityTime: number;
  patience: number;
  orderValue: number;
  color: string;
  walking: boolean;
  direction: "left" | "right";
  timesOrdered: number; // Track how many times this customer has ordered
};

export type MoralChoice = {
  id: string;
  title: string;
  description: string;
  choices: {
    text: string;
    moral: number;
    money?: number;
    beer?: number;
    consequence?: string;
  }[];
  type: "sketchy" | "moral" | "opportunity" | "dilemma";
};

export type DialogType = "good" | "neutral" | "evil" | "chaotic";

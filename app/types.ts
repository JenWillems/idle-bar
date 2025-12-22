export type UpgradeId =
  | "tap_speed"
  | "tap_amount"
  | "sell_price"
  | "auto_seller"
  | "premium_bier"
  | "staff_training"
  | "wine_cellar"
  | "cocktail_bar"
  | "whiskey_collection"
  | "champagne_service"
  | "bar_ambiance"
  | "live_music"
  | "loyalty_program"
  | "social_media"
  | "bar_expansion"
  | "master_bartender"
  | "vip_section"
  | "late_night_hours"
  | "auto_customer_service"
  | "smart_inventory"
  | "passive_income"
  | "auto_upgrade";

export type UpgradeCategory = "TAP" | "PRICE" | "AUTOMATIC" | "MORAL" | "DRINK" | "AMBIANCE" | "MARKETING";

export type Upgrade = {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel?: number;
  effect: number;
  category: UpgradeCategory;
};

export type LogEntry = {
  id: number;
  message: string;
};

export type DrinkType = "bier" | "wijn" | "cocktail" | "whiskey" | "champagne"; // Keep IDs as-is for consistency

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

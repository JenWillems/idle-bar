"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  UpgradeId,
  Upgrade,
  LogEntry,
  DrinkType,
  Drink,
  Customer,
  CustomerQuest,
  CustomerOpportunity,
  MoralChoice,
  SkeletonPersonality
} from "./types";
import SkeletonCommentator from "./components/SkeletonCommentator";
import BarScene from "./components/BarScene";
import MoralChoiceModal from "./components/MoralChoiceModal";
import CustomerQuestModal from "./components/CustomerQuestModal";
import AchievementsPanel from "./components/AchievementsPanel";
import UpgradesPanel from "./components/UpgradesPanel";
import MoralLogPanel from "./components/MoralLogPanel";

const BASE_TAP_INTERVAL = 1000; // ms
const BASE_TAP_AMOUNT = 1; // bier per tick
const BASE_SELL_INTERVAL = 4000; // ms
const BASE_SELL_BATCH = 4; // glazen per verkoop
const GLASS_CAPACITY = 20; // bier-eenheden per glas

// Dranken systeem
const initialDrinks: Drink[] = [
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

// Sarcastische, chaotische dialogen zoals Grim Fandango's Skeleton Dialogue
type DialogType = "good" | "neutral" | "evil" | "chaotic";

const sarcasticDialogs: Record<string, string[]> = {
  sell_good: [
    "Wow, another kind gesture. Hope your halo doesn't slip.",
    "Selling beer like a saint. How... noble.",
    "Another sale, another step toward sainthood. Yawn.",
    "You're selling beer. How revolutionary.",
    "Keep it up, maybe you'll get a medal. Or not.",
    "Another virtuous transaction. How... predictable.",
    "Selling beer with integrity. Groundbreaking.",
    "Your moral compass is showing. Literally.",
    "Another day, another morally correct sale. Riveting.",
    "Selling beer the right way. How... boring."
  ],
  sell_neutral: [
    "Drifting through life like a skeleton in an office chair.",
    "Another sale. Another day. Another... something.",
    "You sold beer. The world keeps spinning. Fascinating.",
    "Just another transaction in this endless cycle of... existence?",
    "Selling beer. Living the dream. Or whatever this is."
  ],
  sell_evil: [
    "YES. Yes. Sell the rotten keg. Profit over people!",
    "That's the spirit! Money first, humanity second!",
    "Excellent! Your moral compass is spinning like a top!",
    "Perfect! Keep selling, keep profiting, keep... whatever this is!",
    "YES! More money, less conscience! The perfect combination!",
    "YES! Sell everything! Morality is overrated!",
    "Perfect! Your path to darkness continues!",
    "YES! Profit over people! That's the way!",
    "Excellent! Your evil empire grows!",
    "YES! Money! Profit! Villainy! Perfect!"
  ],
  sell_chaotic: [
    "You sold beer! Or did you? Who knows! Not me!",
    "SALE! Or was it? Reality is a construct!",
    "Beer sold! Or maybe it sold itself? The universe is chaos!",
    "Transaction complete! Or incomplete! Or... something!",
    "You did a thing! Or didn't! Existence is meaningless!",
    "BEER! SOLD! OR NOT! WHO CARES! NOT ME!",
    "Sale happened! Or didn't! Time is an illusion!",
    "You sold something! Or everything! Or nothing!",
    "Transaction! Or hallucination! Reality is subjective!",
    "SALE COMPLETE! Or incomplete! Or... WHATEVER!"
  ],
  upgrade_good: [
    "Upgrading. How... responsible. Boring, but responsible.",
    "Another upgrade. Your virtue is showing. Literally.",
    "Progress! How wholesome. I'm so proud. Not really.",
    "Upgrade complete. Your moral high ground just got higher.",
    "Nice upgrade. Your conscience must be thrilled."
  ],
  upgrade_neutral: [
    "Upgrade purchased. Life continues. Somehow.",
    "You upgraded something. It does... something. Probably.",
    "Progress made. Or not. Who can tell anymore?",
    "Upgrade complete. The bar is... better? Maybe?",
    "Something happened. An upgrade? Sure, why not."
  ],
  upgrade_evil: [
    "YES! Upgrade! More power! More... something!",
    "Excellent! Upgrade that evil machine!",
    "Perfect! Your bar of darkness grows stronger!",
    "YES! Upgrade everything! Morality is overrated!",
    "Upgrade complete! Your path to villainy continues!"
  ],
  upgrade_chaotic: [
    "UPGRADE! Or was it a downgrade? Who knows!",
    "Something upgraded! Or broke! Or both!",
    "Upgrade! Maybe! Reality is subjective!",
    "You upgraded! Or did reality upgrade you?",
    "UPGRADE COMPLETE! Or incomplete! Or... something!"
  ],
  tap_good: [
    "Tapping beer. How... manual. How... quaint.",
    "You're tapping beer yourself. How hands-on. How... boring.",
    "Manual labor. How virtuous. I'm so impressed. Not really.",
    "Tapping beer. Your work ethic is showing.",
    "Nice tap. Your dedication is... something."
  ],
  tap_neutral: [
    "You tapped beer. The beer is tapped. Fascinating.",
    "Beer tapped. Life continues. As it does.",
    "Tap complete. Or is it? Who can say?",
    "You did a thing. Beer was involved. Probably.",
    "Tap. Beer. Existence. The usual."
  ],
  tap_evil: [
    "YES! Tap that beer! Tap it hard!",
    "Excellent! Manual labor for profit! Perfect!",
    "Tapping beer! Your dedication to profit is... admirable!",
    "YES! Work harder! Profit more!",
    "Tap complete! Your evil empire grows!"
  ],
  tap_chaotic: [
    "TAP! Or was it a slap? Who knows!",
    "You tapped! Or did the beer tap you?",
    "TAP COMPLETE! Or incomplete! Reality is a lie!",
    "Beer tapped! Or untapped! Or... something!",
    "TAP! The universe trembles! Or doesn't!"
  ],
  empty_sell_good: [
    "Trying to sell empty glasses. How... optimistic.",
    "Empty glasses. No beer. How... typical of your luck.",
    "You tried. You failed. How... human.",
    "Empty glasses. Your optimism is... something.",
    "No beer to sell. Your halo is slipping."
  ],
  empty_sell_neutral: [
    "Empty glasses. No sale. Life goes on. Somehow.",
    "You tried to sell nothing. It didn't work. Shocking.",
    "Empty. Like your glass. Like your... something.",
    "No beer. No sale. No... anything. The usual.",
    "Empty glasses. Reality is harsh. Or something."
  ],
  empty_sell_evil: [
    "YES! Try to sell empty glasses! Deceive the customers!",
    "Perfect! Your evil plan to sell nothing begins!",
    "Empty glasses! Your path to villainy continues!",
    "YES! Sell air! Profit from nothing!",
    "Excellent! Your moral bankruptcy is showing!"
  ],
  empty_sell_chaotic: [
    "EMPTY! Or full! Who knows! Not me!",
    "You sold nothing! Or everything! Reality is chaos!",
    "Empty glasses! Or full! The universe doesn't care!",
    "NO BEER! Or maybe beer! Who can tell!",
    "EMPTY! Or not! Existence is meaningless!"
  ],
  no_money_good: [
    "Not enough money. Your virtue doesn't pay the bills.",
    "Broke. But at least you're morally superior. Yay.",
    "No money. Your halo won't help you now.",
    "Can't afford it. Your conscience is free, though.",
    "Broke. But you're a good person. That counts, right?"
  ],
  no_money_neutral: [
    "No money. No upgrade. Life continues. Somehow.",
    "Broke. Like most people. Like... everyone?",
    "Can't afford it. Reality is harsh. Or something.",
    "No money. The usual state of existence.",
    "Broke. Life goes on. Or doesn't. Who knows."
  ],
  no_money_evil: [
    "NO MONEY! Your evil plans are foiled!",
    "Broke! Even villains need cash!",
    "No money! Your path to darkness is... expensive!",
    "BROKE! Even evil costs money!",
    "No cash! Your villainy is on hold!"
  ],
  no_money_chaotic: [
    "NO MONEY! Or maybe money! Who knows!",
    "Broke! Or rich! Reality is subjective!",
    "No cash! Or all the cash! The universe is chaos!",
    "MONEY! Or no money! Existence is meaningless!",
    "BROKE! Or not! Who can tell!"
  ],
  auto_sell_good: [
    "Your staff sold beer. How... efficient. How... boring.",
    "Automatic sale. Your virtue is automated now.",
    "Staff working. You're not. How... typical.",
    "Beer sold automatically. Your conscience is clear. Probably.",
    "Staff did the work. You did... something. Probably."
  ],
  auto_sell_neutral: [
    "Staff sold beer. Life continues. As it does.",
    "Automatic sale. The machine works. Somehow.",
    "Beer sold. By someone. Or something. Probably.",
    "Staff working. Existence continues. Or doesn't.",
    "Sale complete. Or incomplete. Who knows."
  ],
  auto_sell_evil: [
    "YES! Staff sold beer! Profit without effort!",
    "Perfect! Your evil empire runs itself!",
    "Automatic profit! Your path to darkness is automated!",
    "YES! Money flows! Your villainy grows!",
    "Staff working! You're not! Perfect!"
  ],
  auto_sell_chaotic: [
    "STAFF SOLD! Or didn't! Who knows!",
    "AUTOMATIC! Or manual! Reality is chaos!",
    "BEER SOLD! Or not! The universe doesn't care!",
    "STAFF! Or robots! Or... something!",
    "SALE! Or no sale! Existence is meaningless!"
  ]
};

function getMoralCategory(moral: number): DialogType {
  // Meer chaos bij extreme moreel waarden
  const chaosChance = Math.random();
  if (chaosChance > 0.85) return "chaotic"; // 15% kans op chaos, altijd
  
  if (moral >= 90) return chaosChance > 0.6 ? "good" : "chaotic";
  if (moral <= 40) return chaosChance > 0.6 ? "evil" : "chaotic";
  if (moral >= 65 && moral <= 75) return "neutral";
  
  return moral > 75 ? "good" : "evil";
}

function getRandomDialog(action: string, moral: number): string {
  const category = getMoralCategory(moral);
  const key = `${action}_${category}`;
  const dialogs = sarcasticDialogs[key] || sarcasticDialogs[`${action}_neutral`] || ["Something happened. Probably."];
  return dialogs[Math.floor(Math.random() * dialogs.length)];
}

// Grim Fandango-stijl morele keuzes en events
const moralEvents: MoralChoice[] = [
  {
    id: "sketchy_supplier",
    title: "A Shady Offer",
    description: "A man in a suit that's clearly too small (or he's too big, who knows) slips into your bar. 'Psst, friend,' he whispers, his eyes darting nervously toward the door as if expecting the police to burst in at any moment. 'I've got a deal for you. Beer for half the price. Nobody needs to know. What do you say?' He rubs his hands together in a way that reminds you of a bad movie.",
    type: "sketchy",
    choices: [
      {
        text: "Accept the deal — save money, but your conscience...",
        moral: -15,
        money: 50,
        consequence: "You take the deal. The beer tastes... as if someone added a strange flavor to it. Your staff looks at you as if you just announced you're planning to sell the bar to a fast-food chain."
      },
      {
        text: "Refuse — you have principles, even in this bar.",
        moral: +8,
        consequence: "You send him away with a polite but firm 'No, thank you.' He leaves disappointed, while your staff looks at you with respect. Your wallet cries softly in the corner, but your conscience sings a cheerful tune."
      }
    ]
  },
  {
    id: "drunk_customer",
    title: "The Drunk Customer",
    description: "A customer who's so drunk he probably thinks he's an airplane tries to order another beer. He waves his empty glass like a flag and mumbles something about 'just one more beer, I promise!' Your staff looks at you with the expression of someone who knows this is a bad idea, but also knows you're the boss.",
    type: "moral",
    choices: [
      {
        text: "Give him another beer — money is money, right?",
        moral: -12,
        money: 8,
        consequence: "You serve him. He later almost falls off his stool and tries to have a conversation with a plant. Your conscience gnaws at you like a hungry mouse on cheese. A very hungry mouse."
      },
      {
        text: "Refuse and call a taxi — responsibility over profit.",
        moral: +10,
        consequence: "You politely refuse ('Sorry, friend, I think you've had enough') and call a taxi. Your staff smiles as if you just saved the world. Well done, detective. You get an imaginary medal."
      }
    ]
  },
  {
    id: "tax_inspector",
    title: "The Tax Inspector",
    description: "A man with a briefcase that looks so official you almost think it's a prop comes in. 'Good afternoon,' he says with a smile so wide you wonder if his face will crack. 'I'm from the tax department. Well, actually... I can help you with certain administrative problems. For a small fee, of course.' He rubs his thumb and forefinger together in a way that universally means: 'Money, now.'",
    type: "sketchy",
    choices: [
      {
        text: "Bribe him — quick money, but risk of problems.",
        moral: -20,
        money: -100,
        consequence: "You pay him. He disappears with a wink and a 'See you later, friend!' You wonder if this was smart, or if you just got scammed by someone who probably isn't even from the tax department. Your conscience screams, but your wallet whispers: 'It was worth it... right?'"
      },
      {
        text: "Refuse — stay honest, even if it costs money.",
        moral: +12,
        consequence: "You refuse with a firm 'No, thank you.' He leaves with a frown that suggests he doesn't hear this often. You sleep better that night, but your bank account looks at you as if you just took away its favorite toy."
      }
    ]
  },
  {
    id: "employee_break",
    title: "Break Time",
    description: "Your staff looks as if they just ran a marathon, but without the medal. They ask for a break with eyes that beg for mercy. You have choices: let them rest like normal people, or push through for more profit like a real... businessman?",
    type: "dilemma",
    choices: [
      {
        text: "Give them a break — humanity over profit.",
        moral: +15,
        beer: -10,
        consequence: "You give them a break. They come back with new energy and look at you as if you just saved their lives. They respect your leadership, which is a strange feeling. You almost feel... good? Strange."
      },
      {
        text: "Push through — time is money, and money is... money.",
        moral: -10,
        money: 30,
        consequence: "You refuse the break. They work on, but their eyes lose their shine as if someone turned off the light switch. Efficiency at the cost of morale. Your conscience whispers: 'Was this worth it?' Your wallet answers: 'Yes!'"
      }
    ]
  },
  {
    id: "charity_night",
    title: "A Good Deed",
    description: "A local organization comes in with a smile so sincere you almost think it's fake. 'We're collecting money for a good cause,' she says, shaking a box that's clearly empty. 'Would you like to donate part of your profits this week? It would help your reputation!' Your wallet starts crying.",
    type: "opportunity",
    choices: [
      {
        text: "Donate — good for the soul, bad for the wallet.",
        moral: +18,
        money: -80,
        consequence: "You donate. The community appreciates it as if you just saved the world. You feel... good? Strange feeling. You wonder if this is how normal people feel."
      },
      {
        text: "Refuse — you have your own problems.",
        moral: -5,
        consequence: "You say no with an excuse so bad that even you don't believe it. They leave disappointed. Your wallet is happy, your conscience less so. It's a trade-off, like everything in life."
      }
    ]
  },
  {
    id: "watered_beer",
    title: "The Temptation",
    description: "An old acquaintance from your past stops by. He looks as if he just stepped out of a time machine, complete with a hat that probably comes from the 1920s. 'I know a trick,' he says with a grin that suggests he's done this before. 'Water in the beer. Nobody notices, and you earn double. Old times, right?' He rubs his hands together as if he's come up with a master plan.",
    type: "sketchy",
    choices: [
      {
        text: "Apply the trick — quick money, but...",
        moral: -25,
        money: 120,
        consequence: "You do it. The money flows in like a river after rain, but every glass you serve feels like a lie. Your customers look at you as if they're tasting something strange, but say nothing. Your conscience screams, but your wallet sings a cheerful tune."
      },
      {
        text: "Refuse — integrity has its price.",
        moral: +15,
        consequence: "You refuse with a firm 'No, thank you.' He laughs and says: 'You've changed.' Maybe that's good. Maybe you've finally grown up. Or maybe you've just become boring. Who knows?"
      }
    ]
  },
  {
    id: "competitor_sabotage",
    title: "An Unethical Proposal",
    description: "A competitor offers you money to sabotage his bar. He looks as if he just stepped out of a bad movie, complete with a mustache that's too perfect to be real. 'A few bad reviews, some rumors... nothing personal, just business,' he says as if asking you to get the newspaper. 'What do you say?'",
    type: "sketchy",
    choices: [
      {
        text: "Accept — dirty play, but profit.",
        moral: -18,
        money: 150,
        consequence: "You do it. The money is good, but your reflection looks at you differently as if it no longer recognizes you. You wonder if this is how you become a villain. Slowly, one bad choice at a time."
      },
      {
        text: "Refuse — fair competition, or nothing.",
        moral: +12,
        consequence: "You send him away with a firm 'No, thank you.' He leaves disappointed, as if he doesn't hear this often. Honesty wins, even in this dark world. You almost feel... proud? Strange feeling."
      }
    ]
  },
  {
    id: "homeless_person",
    title: "A Stranger at the Door",
    description: "A homeless man asks for a glass of water and a warm place. He looks as if he hasn't had a good night in a while, but his eyes are still clear. Your staff looks at you as if waiting for your decision. What do you do?",
    type: "moral",
    choices: [
      {
        text: "Help — a small act of humanity.",
        moral: +12,
        money: -5,
        consequence: "You give him water and a warm corner. He thanks you with sincere eyes that suggest he doesn't experience this often. It feels good, as if you just did something good. Strange feeling, but pleasant."
      },
      {
        text: "Send him away — you don't have time for this.",
        moral: -8,
        consequence: "You send him away with an excuse so bad that even you don't believe it. He leaves without a word, but his look says enough. The silence is loud, and your conscience whispers: 'Was this necessary?'"
      }
    ]
  }
];

const initialUpgrades: Upgrade[] = [
  {
    id: "tap_speed",
    name: "Snellere Tapkraan",
    description: "Verkort de tijd tussen automatische bier-ticks.",
    baseCost: 20,
    costMultiplier: 1.35,
    level: 0,
    effect: 0.06,
    category: "TAP"
  },
  {
    id: "tap_amount",
    name: "Grotere Glazen",
    description: "Verhoogt de hoeveelheid bier per tick.",
    baseCost: 35,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.25,
    category: "TAP"
  },
  {
    id: "sell_price",
    name: "Happy Hour Marketing",
    description: "Elke glas verkoopt voor meer geld.",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.2,
    category: "PRIJS"
  },
  {
    id: "auto_seller",
    name: "Bar Personeel",
    description: "Verkoopt automatisch bier terwijl jij AFK bent. ESSENTIEEL voor idle gameplay.",
    baseCost: 50,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AUTOMATISCH"
  },
  {
    id: "premium_bier",
    name: "Premium Speciaalbier",
    description: "Glazen leveren direct meer winst op.",
    baseCost: 120,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.35,
    category: "PRIJS"
  },
  {
    id: "staff_training",
    name: "Team Coaching",
    description: "Verhoogt het moreel van je team op lange termijn.",
    baseCost: 90,
    costMultiplier: 1.4,
    level: 0,
    effect: 1.5,
    category: "MORAAL"
  },
  {
    id: "wine_cellar",
    name: "Wijnkelder",
    description: "Ontgrendel wijn serveren. Duurder, maar klanten betalen meer.",
    baseCost: 200,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.3,
    category: "DRANK"
  },
  {
    id: "cocktail_bar",
    name: "Cocktail Bar",
    description: "Begin met cocktails serveren. Complex, maar zeer winstgevend.",
    baseCost: 500,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.4,
    category: "DRANK"
  },
  {
    id: "whiskey_collection",
    name: "Whiskey Collectie",
    description: "Premium whiskey's. Voor de echte kenners... en hun portemonnee.",
    baseCost: 800,
    costMultiplier: 1.55,
    level: 0,
    effect: 0.5,
    category: "DRANK"
  },
  {
    id: "champagne_service",
    name: "Champagne Service",
    description: "De crème de la crème. Voor de elite... of degenen die denken dat ze het zijn.",
    baseCost: 1500,
    costMultiplier: 1.7,
    level: 0,
    effect: 0.6,
    category: "DRANK"
  },
  {
    id: "bar_ambiance",
    name: "Bar Ambiance",
    description: "Betere sfeer trekt meer klanten. Of misschien gewoon betere klanten.",
    baseCost: 300,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AMBIANCE"
  },
  {
    id: "live_music",
    name: "Live Muziek",
    description: "Een band trekt klanten aan. Of jaagt ze weg. Wie weet.",
    baseCost: 600,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.35,
    category: "AMBIANCE"
  },
  {
    id: "loyalty_program",
    name: "Loyalty Programma",
    description: "Klanten komen vaker terug. Of ze blijven langer. Beide is winst.",
    baseCost: 400,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.3,
    category: "MARKETING"
  },
  {
    id: "social_media",
    name: "Social Media Marketing",
    description: "Instagram, TikTok, whatever. Zolang het geld oplevert.",
    baseCost: 250,
    costMultiplier: 1.35,
    level: 0,
    effect: 0.2,
    category: "MARKETING"
  },
  {
    id: "bar_expansion",
    name: "Bar Uitbreiding",
    description: "Meer ruimte = meer klanten = meer geld. Wiskunde.",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.4,
    category: "TAP"
  },
  {
    id: "master_bartender",
    name: "Master Bartender",
    description: "Een echte professional. Duur, maar hij maakt perfecte drankjes.",
    baseCost: 1200,
    costMultiplier: 1.65,
    level: 0,
    effect: 0.45,
    category: "AUTOMATISCH"
  },
  {
    id: "vip_section",
    name: "VIP Sectie",
    description: "Voor de rijken. Of degenen die denken dat ze rijk zijn. Beide betalen goed.",
    baseCost: 2000,
    costMultiplier: 1.75,
    level: 0,
    effect: 0.5,
    category: "PRIJS"
  },
  {
    id: "late_night_hours",
    name: "Late Night Uren",
    description: "Open tot laat. Meer tijd = meer geld. Of meer problemen. Waarschijnlijk beide.",
    baseCost: 700,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.3,
    category: "AUTOMATISCH"
  },
  {
    id: "auto_customer_service",
    name: "Automatische Klantenservice",
    description: "Je personeel handelt klanten automatisch af. Volledig idle!",
    baseCost: 150,
    costMultiplier: 1.4,
    level: 0,
    effect: 0.2,
    category: "AUTOMATISCH"
  },
  {
    id: "smart_inventory",
    name: "Slimme Voorraad",
    description: "Automatisch de beste drank selecteren voor maximale winst.",
    baseCost: 300,
    costMultiplier: 1.45,
    level: 0,
    effect: 0.25,
    category: "AUTOMATISCH"
  },
  {
    id: "passive_income",
    name: "Passief Inkomen",
    description: "Geld verdient zichzelf. Letterlijk. Idle perfection.",
    baseCost: 500,
    costMultiplier: 1.5,
    level: 0,
    effect: 0.15,
    category: "AUTOMATISCH"
  },
  {
    id: "auto_upgrade",
    name: "Automatische Upgrades",
    description: "Koop automatisch upgrades wanneer je het kunt betalen. Volledig AFK!",
    baseCost: 1000,
    costMultiplier: 1.6,
    level: 0,
    effect: 0.1,
    category: "AUTOMATISCH"
  }
];

function calculateUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
  );
}

export default function HomePage() {
  const [beer, setBeer] = useState(0); // ruwe bier-eenheden
  const [money, setMoney] = useState(0);
  const [totalGlassesSold, setTotalGlassesSold] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [activeDrink, setActiveDrink] = useState<DrinkType>("bier");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(1);
  const [moral, setMoral] = useState(70); // 0-130, Grim Fandango-stijl moreel systeem
  const [activeChoice, setActiveChoice] = useState<MoralChoice | null>(null);
  const [activeCustomerQuest, setActiveCustomerQuest] = useState<CustomerQuest | null>(null);
  const [customerForMoralEvent, setCustomerForMoralEvent] = useState<Customer | null>(null); // Track which customer triggered moral event
  const [lastEventTime, setLastEventTime] = useState(0);
  const [skeletonComment, setSkeletonComment] = useState<string>("");
  const [skeletonVisible, setSkeletonVisible] = useState(false);
  const [lastPunishmentTime, setLastPunishmentTime] = useState(0);
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [goldenEventActive, setGoldenEventActive] = useState(false);
  const [totalMoralChoices, setTotalMoralChoices] = useState(0);
  const [totalCustomersServed, setTotalCustomersServed] = useState(0);
  const [maxUpgradeLevel, setMaxUpgradeLevel] = useState(0);
  const [barOpen, setBarOpen] = useState(false); // Bar starts closed - customers only show when opened
  const [unlockedCustomers, setUnlockedCustomers] = useState<Set<SkeletonPersonality>>(new Set(["deco"])); // Start with Deco unlocked
  const [servedCustomers, setServedCustomers] = useState<Map<string, { personality: SkeletonPersonality; lastServed: number }>>(new Map()); // Track served customers for returns
  const [activeTab, setActiveTab] = useState<"stats" | "upgrades" | "achievements">("stats");

  // Afgeleide stats op basis van upgrades en actieve drank
  const stats = useMemo(() => {
    const currentDrink = drinks.find((d: Drink) => d.type === activeDrink) || drinks[0];
    const tapSpeedLevel = upgrades.find((u: Upgrade) => u.id === "tap_speed")?.level ?? 0;
    const tapAmountLevel =
      upgrades.find((u: Upgrade) => u.id === "tap_amount")?.level ?? 0;
    const sellPriceLevel =
      upgrades.find((u: Upgrade) => u.id === "sell_price")?.level ?? 0;
    const autoSellerLevel =
      upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
    const premiumLevel =
      upgrades.find((u: Upgrade) => u.id === "premium_bier")?.level ?? 0;
    const staffLevel =
      upgrades.find((u: Upgrade) => u.id === "staff_training")?.level ?? 0;
    
    // Nieuwe upgrades
    const wineLevel = upgrades.find((u: Upgrade) => u.id === "wine_cellar")?.level ?? 0;
    const cocktailLevel = upgrades.find((u: Upgrade) => u.id === "cocktail_bar")?.level ?? 0;
    const whiskeyLevel = upgrades.find((u: Upgrade) => u.id === "whiskey_collection")?.level ?? 0;
    const champagneLevel = upgrades.find((u: Upgrade) => u.id === "champagne_service")?.level ?? 0;
    const ambianceLevel = upgrades.find((u: Upgrade) => u.id === "bar_ambiance")?.level ?? 0;
    const musicLevel = upgrades.find((u: Upgrade) => u.id === "live_music")?.level ?? 0;
    const loyaltyLevel = upgrades.find((u: Upgrade) => u.id === "loyalty_program")?.level ?? 0;
    const socialLevel = upgrades.find((u: Upgrade) => u.id === "social_media")?.level ?? 0;
    const expansionLevel = upgrades.find((u: Upgrade) => u.id === "bar_expansion")?.level ?? 0;
    const bartenderLevel = upgrades.find((u: Upgrade) => u.id === "master_bartender")?.level ?? 0;
    const vipLevel = upgrades.find((u: Upgrade) => u.id === "vip_section")?.level ?? 0;
    const lateNightLevel = upgrades.find((u: Upgrade) => u.id === "late_night_hours")?.level ?? 0;

    // Drank-specifieke productietijd (langzamer voor duurdere dranken)
    const drinkProductionTime = currentDrink.productionTime * (1 - tapSpeedLevel * 0.05);
    const tapInterval = Math.max(300, drinkProductionTime * (1 - tapSpeedLevel * 0.05));
    
    // Tap amount met drank-specifieke capaciteit
    const drinkCapacity = currentDrink.capacity;
    const tapPerTick = BASE_TAP_AMOUNT * (1 + tapAmountLevel * 0.25) * (drinkCapacity / 20);

    // Prijs op basis van drank + upgrades
    const basePricePerGlass = currentDrink.basePrice;
    const drinkLevel = currentDrink.level;
    const priceBonus =
      sellPriceLevel * 0.3 + 
      premiumLevel * 0.4 + 
      staffLevel * 0.05 +
      wineLevel * 0.1 +
      cocktailLevel * 0.15 +
      whiskeyLevel * 0.2 +
      champagneLevel * 0.25 +
      ambianceLevel * 0.15 +
      musicLevel * 0.1 +
      loyaltyLevel * 0.12 +
      socialLevel * 0.08 +
      vipLevel * 0.3 +
      drinkLevel * 0.1;
    const finalPricePerGlass = basePricePerGlass * (1 + priceBonus);

    const autoSellInterval =
      BASE_SELL_INTERVAL * Math.max(0.3, 1 - autoSellerLevel * 0.12);
    const autoSellBatch =
      BASE_SELL_BATCH * (1 + autoSellerLevel * 0.25 + staffLevel * 0.1);

    const moralEffective = Math.min(
      130,
      Math.max(0, moral + staffLevel * 4 - autoSellerLevel * 2)
    );
    
    // Nieuwe upgrade bonussen voor auto-sell (gebruik al gedeclareerde variabelen)
    const improvedAutoSellInterval = autoSellInterval * (1 - bartenderLevel * 0.08 - lateNightLevel * 0.05);
    const improvedAutoSellBatch = autoSellBatch * (1 + bartenderLevel * 0.2 + expansionLevel * 0.15);

    // Fable-stijl: ECHT belangrijke moraal effecten
    // Goed (90+): Grote bonussen - mensen vertrouwen je, betalen meer, werken harder
    // Neutraal (50-90): Normale waarden
    // Slecht (<50): Grote penalties - mensen wantrouwen je, betalen minder, werken slechter
    let moralMultiplier = 1.0;
    let priceMultiplier = 1.0;
    let efficiencyMultiplier = 1.0;
    
    if (moralEffective >= 90) {
      // Goed: +50% productie, +40% prijs, +30% efficiency
      moralMultiplier = 1.5;
      priceMultiplier = 1.4;
      efficiencyMultiplier = 1.3;
    } else if (moralEffective >= 70) {
      // Goed genoeg: +25% productie, +20% prijs, +15% efficiency
      moralMultiplier = 1.25;
      priceMultiplier = 1.2;
      efficiencyMultiplier = 1.15;
    } else if (moralEffective >= 50) {
      // Neutraal: Normale waarden
      moralMultiplier = 1.0;
      priceMultiplier = 1.0;
      efficiencyMultiplier = 1.0;
    } else if (moralEffective >= 30) {
      // Slecht: -20% productie, -25% prijs, -15% efficiency
      moralMultiplier = 0.8;
      priceMultiplier = 0.75;
      efficiencyMultiplier = 0.85;
    } else {
      // Zeer slecht: -40% productie, -50% prijs, -30% efficiency
      moralMultiplier = 0.6;
      priceMultiplier = 0.5;
      efficiencyMultiplier = 0.7;
    }

    // Prestige bonussen (permanent)
    const prestigeMultiplier = 1 + (prestigePoints * 0.1); // 10% per prestige punt

    return {
      tapInterval: (tapInterval / efficiencyMultiplier) / prestigeMultiplier,
      tapPerTick: tapPerTick * moralMultiplier * prestigeMultiplier,
      pricePerGlass: finalPricePerGlass * priceMultiplier * prestigeMultiplier,
      autoSellInterval: (improvedAutoSellInterval / efficiencyMultiplier) / prestigeMultiplier,
      autoSellBatch: improvedAutoSellBatch * efficiencyMultiplier * prestigeMultiplier,
      moralEffective,
      prestigeMultiplier,
      currentDrink,
      drinkCapacity: currentDrink.capacity
    };
  }, [upgrades, moral, prestigePoints, drinks, activeDrink]);

  // Offline progress berekenen bij mount
  useEffect(() => {
    const savedTime = localStorage.getItem('lastSaveTime');
    if (savedTime) {
      const offlineTime = Date.now() - parseInt(savedTime);
      const offlineMinutes = Math.floor(offlineTime / 60000);
      if (offlineMinutes > 1) {
        // Bereken offline progress (max 8 uur) - gebruik basis stats
        const maxOfflineMinutes = Math.min(offlineMinutes, 480);
        const baseTapPerSecond = stats.tapPerTick / (stats.tapInterval / 1000);
        const offlineBeer = baseTapPerSecond * (maxOfflineMinutes * 60);
        if (offlineBeer > 0) {
          setBeer((b: number) => b + offlineBeer);
          pushLog(`Offline progress: ${maxOfflineMinutes} minuten, +${offlineBeer.toFixed(0)} cl bier!`);
        }
      }
    }
    setLastSaveTime(Date.now());
  }, [stats.tapPerTick, stats.tapInterval]);

  // Auto-save elke 10 seconden
  useEffect(() => {
    const id = window.setInterval(() => {
      localStorage.setItem('lastSaveTime', Date.now().toString());
      setLastSaveTime(Date.now());
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  // Automatische bier-ticks
  useEffect(() => {
    const id = window.setInterval(() => {
      setBeer((prev: number) => prev + stats.tapPerTick * (goldenEventActive ? 3 : 1));
    }, stats.tapInterval);
    return () => window.clearInterval(id);
  }, [stats.tapInterval, stats.tapPerTick, goldenEventActive]);

  // Automatisch verkopen (als er tenminste personeel is)
  useEffect(() => {
    const autoSellerLevel =
      upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
    if (autoSellerLevel <= 0) {
      return;
    }

    const id = window.setInterval(() => {
      setBeer((prevBeer: number) => {
        const drinkCapacity = stats.drinkCapacity;
        const availableGlasses = Math.floor(prevBeer / drinkCapacity);
        const toSell = Math.min(
          availableGlasses,
          Math.max(1, Math.floor(stats.autoSellBatch))
        );
        if (toSell <= 0) return prevBeer;

        const earned = toSell * stats.pricePerGlass * (goldenEventActive ? 2 : 1);
        setMoney((m: number) => {
          const newMoney = m + earned;
          setTotalEarned((te: number) => te + earned);
          return newMoney;
        });
        setTotalGlassesSold((g: number) => g + toSell);
        // Alleen 20% kans op skeleton comment bij auto-verkoop (komt vaak voor)
        if (Math.random() > 0.8) {
          const dialog = getRandomDialog("auto_sell", moral);
          showSkeletonComment(dialog);
        }
        const drinkName = stats.currentDrink.name.toLowerCase();
        pushLog(`Your staff sold ${toSell} ${drinkName} for €${earned.toFixed(0)}.`);
        // Geen morale meer bij auto-verkoop - alleen goede keuzes geven morale
        return prevBeer - toSell * drinkCapacity;
      });
    }, stats.autoSellInterval);

    return () => window.clearInterval(id);
  }, [stats.autoSellInterval, stats.autoSellBatch, stats.pricePerGlass, upgrades, goldenEventActive]);

  // Moreel langzaam laten schuiven richting neutraal
  useEffect(() => {
    const id = window.setInterval(() => {
      setMoral((prev: number) => {
        if (prev > 72) return prev - 0.3;
        if (prev < 68) return prev + 0.3;
        return prev;
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  // Morale events are now ONLY triggered by talking to customers - removed automatic system

  // Fable 3-stijl corruptie/straf systeem - automatische punishments bij lage morale
  useEffect(() => {
    const checkForPunishment = () => {
      const now = Date.now();
      const timeSinceLastPunishment = now - lastPunishmentTime;
      const moralEffective = stats.moralEffective;
      
      // Bij zeer lage morale (< 20): veel vaker straffen (elke 15-25 seconden) - corporate is meedogenloos
      // Bij lage morale (< 40): regelmatig straffen (elke 30-45 seconden)
      if (moralEffective < 20) {
        const minInterval = 15000;
        const maxInterval = 25000;
        if (timeSinceLastPunishment >= minInterval + Math.random() * (maxInterval - minInterval)) {
          triggerPunishment("severe");
          setLastPunishmentTime(now);
        }
      } else if (moralEffective < 40) {
        const minInterval = 30000;
        const maxInterval = 45000;
        if (timeSinceLastPunishment >= minInterval + Math.random() * (maxInterval - minInterval)) {
          triggerPunishment("moderate");
          setLastPunishmentTime(now);
        }
      }
    };

    const id = window.setInterval(checkForPunishment, 5000);
    return () => window.clearInterval(id);
  }, [lastPunishmentTime, stats.moralEffective]);

  // Golden Events (zoals Cookie Clicker) - willekeurige bonussen
  useEffect(() => {
    const checkGoldenEvent = () => {
      // 1% chance every 10 seconds for golden event
      if (Math.random() < 0.01 && !goldenEventActive) {
        setGoldenEventActive(true);
        pushLog("✨ GOLDEN EVENT! 3x beer production and 2x sell price for 30 seconds!");
        showSkeletonComment("LUCKY! You found a golden opportunity! Or did it find you?");
        
        // Track golden event achievement
        setAchievements((prev: Set<string>) => {
          if (!prev.has("golden_moment")) {
            const newSet = new Set(prev);
            newSet.add("golden_moment");
            pushLog("🏆 Achievement: Golden Moment! You experienced a golden event!");
            return newSet;
          }
          return prev;
        });
        
        setTimeout(() => {
          setGoldenEventActive(false);
          pushLog("Golden event is over. Back to normal.");
        }, 30000);
      }
    };
    const id = window.setInterval(checkGoldenEvent, 10000);
    return () => window.clearInterval(id);
  }, [goldenEventActive]);

  // Track max upgrade level for achievements - optimized to only update when needed
  useEffect(() => {
    const maxLevel = Math.max(...upgrades.map(u => u.level), 0);
    if (maxLevel > maxUpgradeLevel) {
      setMaxUpgradeLevel(maxLevel);
    }
  }, [upgrades]); // Removed maxUpgradeLevel from deps to prevent unnecessary checks

  // Optimized achievements system - only check when values change significantly
  useEffect(() => {
    const newAchievements: string[] = [];
    
    // Sales milestones
    if (totalGlassesSold >= 100 && !achievements.has("first_100")) {
      newAchievements.push("first_100");
      pushLog("🏆 Achievement: First 100 glasses sold!");
    }
    if (totalGlassesSold >= 1000 && !achievements.has("thousand_sold")) {
      newAchievements.push("thousand_sold");
      pushLog("🏆 Achievement: 1000 glasses sold! You're a real bar owner!");
    }
    if (totalGlassesSold >= 10000 && !achievements.has("ten_thousand_sold")) {
      newAchievements.push("ten_thousand_sold");
      pushLog("🏆 Achievement: 10,000 glasses sold! You're a legend!");
    }
    if (totalGlassesSold >= 100000 && !achievements.has("hundred_thousand_sold")) {
      newAchievements.push("hundred_thousand_sold");
      pushLog("🏆 Achievement: 100,000 glasses sold! The bar never closes!");
    }
    
    // Money milestones
    if (totalEarned >= 1000 && !achievements.has("thousandaire")) {
      newAchievements.push("thousandaire");
      pushLog("🏆 Achievement: €1,000 total earned! Your first thousand!");
    }
    if (totalEarned >= 10000 && !achievements.has("ten_thousandaire")) {
      newAchievements.push("ten_thousandaire");
      pushLog("🏆 Achievement: €10,000 total earned! Business is booming!");
    }
    if (totalEarned >= 100000 && !achievements.has("hundred_thousandaire")) {
      newAchievements.push("hundred_thousandaire");
      pushLog("🏆 Achievement: €100,000 total earned! You're a tycoon!");
    }
    if (totalEarned >= 1000000 && !achievements.has("millionaire")) {
      newAchievements.push("millionaire");
      pushLog("🏆 Achievement: €1,000,000 total earned! You've made it!");
    }
    
    // Moral achievements
    if (moral >= 100 && !achievements.has("saint")) {
      newAchievements.push("saint");
      pushLog("🏆 Achievement: Saint! Your moral is perfect!");
    }
    if (moral >= 120 && !achievements.has("angel")) {
      newAchievements.push("angel");
      pushLog("🏆 Achievement: Angel! You've transcended morality!");
    }
    if (moral <= 20 && !achievements.has("villain")) {
      newAchievements.push("villain");
      pushLog("🏆 Achievement: Villain! Your moral is ruined!");
    }
    if (moral <= 10 && !achievements.has("demon")) {
      newAchievements.push("demon");
      pushLog("🏆 Achievement: Demon! You've embraced the darkness!");
    }
    if (moral >= 65 && moral <= 75 && !achievements.has("neutral_master")) {
      newAchievements.push("neutral_master");
      pushLog("🏆 Achievement: Neutral Master! Perfectly balanced!");
    }
    
    // Prestige achievements
    if (prestigeLevel >= 1 && !achievements.has("first_prestige")) {
      newAchievements.push("first_prestige");
      pushLog("🏆 Achievement: First Prestige! You start over, but stronger!");
    }
    if (prestigeLevel >= 5 && !achievements.has("prestige_master")) {
      newAchievements.push("prestige_master");
      pushLog("🏆 Achievement: Prestige Master! You've reset 5 times!");
    }
    if (prestigeLevel >= 10 && !achievements.has("prestige_legend")) {
      newAchievements.push("prestige_legend");
      pushLog("🏆 Achievement: Prestige Legend! 10 resets completed!");
    }
    
    // Upgrade achievements
    if (maxUpgradeLevel >= 10 && !achievements.has("upgrade_enthusiast")) {
      newAchievements.push("upgrade_enthusiast");
      pushLog("🏆 Achievement: Upgrade Enthusiast! Level 10 upgrade reached!");
    }
    if (maxUpgradeLevel >= 25 && !achievements.has("upgrade_master")) {
      newAchievements.push("upgrade_master");
      pushLog("🏆 Achievement: Upgrade Master! Level 25 upgrade reached!");
    }
    if (maxUpgradeLevel >= 50 && !achievements.has("upgrade_legend")) {
      newAchievements.push("upgrade_legend");
      pushLog("🏆 Achievement: Upgrade Legend! Level 50 upgrade reached!");
    }
    
    // Customer interaction achievements
    if (totalCustomersServed >= 50 && !achievements.has("social_bartender")) {
      newAchievements.push("social_bartender");
      pushLog("🏆 Achievement: Social Bartender! 50 customers served!");
    }
    if (totalCustomersServed >= 500 && !achievements.has("people_person")) {
      newAchievements.push("people_person");
      pushLog("🏆 Achievement: People Person! 500 customers served!");
    }
    
    // Moral choice achievements
    if (totalMoralChoices >= 10 && !achievements.has("moral_philosopher")) {
      newAchievements.push("moral_philosopher");
      pushLog("🏆 Achievement: Moral Philosopher! 10 moral choices made!");
    }
    if (totalMoralChoices >= 50 && !achievements.has("ethical_expert")) {
      newAchievements.push("ethical_expert");
      pushLog("🏆 Achievement: Ethical Expert! 50 moral choices made!");
    }
    
    // Drink variety achievements
    const unlockedDrinks = drinks.filter(d => d.unlocked).length;
    if (unlockedDrinks >= 3 && !achievements.has("drink_collector")) {
      newAchievements.push("drink_collector");
      pushLog("🏆 Achievement: Drink Collector! 3 different drinks unlocked!");
    }
    if (unlockedDrinks >= 5 && !achievements.has("drink_master")) {
      newAchievements.push("drink_master");
      pushLog("🏆 Achievement: Drink Master! All drinks unlocked!");
    }
    
    // Golden event achievement - track separately
    
    if (newAchievements.length > 0) {
      setAchievements((prev: Set<string>) => {
        const newSet = new Set(prev);
        newAchievements.forEach(a => newSet.add(a));
        return newSet;
      });
    }
  }, [totalGlassesSold, totalEarned, moral, prestigeLevel, maxUpgradeLevel, totalCustomersServed, totalMoralChoices, drinks.length, achievements, goldenEventActive]);

  // Skeleton personalities with traits - each has unique personality
  const skeletonPersonalities: Record<SkeletonPersonality, {
    name: string;
    image: string;
    color: string;
    traits: {
      friendliness: number; // 0-100
      generosity: number; // 0-100
      patience: number; // 0-100
      dialogueStyle: "sarcastic" | "friendly" | "mysterious" | "rebellious" | "smooth" | "wicked";
      catchphrases: string[];
      personalityDescription: string; // Unique personality description
    };
  }> = {
    deco: {
      name: "Deco",
      image: "/img/deco-skeleton.png",
      color: "#d4a574",
      traits: {
        friendliness: 75,
        generosity: 65,
        patience: 85,
        dialogueStyle: "friendly",
        catchphrases: [
          "Looking good, barkeep! This place has real style!",
          "I appreciate the ambiance here. Very classy!",
          "You know what? This bar has character. I like that.",
          "The decor here is simply marvelous!",
          "I'll definitely be coming back. This place is special!"
        ],
        personalityDescription: "Deco is a sophisticated skeleton who appreciates fine aesthetics and good manners. Always polite and well-spoken, Deco values quality over quantity and enjoys engaging in pleasant conversation. They're the type who notices the little details that make a place special."
      }
    },
    evil: {
      name: "Malice",
      image: "/img/evil-skeleton.png",
      color: "#8b0000",
      traits: {
        friendliness: 15,
        generosity: 25,
        patience: 35,
        dialogueStyle: "wicked",
        catchphrases: [
          "Your prices are... interesting. Very interesting.",
          "I've seen better. Much better. But I suppose this will do.",
          "This better be worth it, or we'll have... words.",
          "You know, I could make things difficult for you. Very difficult.",
          "I don't like waiting. And I really don't like being disappointed."
        ],
        personalityDescription: "Malice is a sinister skeleton with a dark sense of humor and a tendency to be demanding. They're always looking for an angle, testing boundaries, and aren't afraid to make threats. Malice enjoys making others uncomfortable and has little patience for incompetence."
      }
    },
    flower: {
      name: "Bloom",
      image: "/img/flower-skeleton.png",
      color: "#8b9a5b",
      traits: {
        friendliness: 95,
        generosity: 90,
        patience: 95,
        dialogueStyle: "friendly",
        catchphrases: [
          "What a lovely place! I'm so happy to be here!",
          "You're doing great! Keep up the wonderful work!",
          "This is such a positive atmosphere! I love it!",
          "Thank you so much for your kindness! You're amazing!",
          "I just want to spread some joy today! Life is beautiful!"
        ],
        personalityDescription: "Bloom is an incredibly positive and cheerful skeleton who sees the best in everyone and everything. They're generous, patient, and always ready with a kind word or compliment. Bloom genuinely cares about others' wellbeing and tries to make everyone's day a little brighter."
      }
    },
    rebel: {
      name: "Rebel",
      image: "/img/rebel-skeleton.png",
      color: "#c97d60",
      traits: {
        friendliness: 55,
        generosity: 60,
        patience: 25,
        dialogueStyle: "rebellious",
        catchphrases: [
          "Rules? What rules? I make my own rules!",
          "I do what I want, when I want! That's just how I roll!",
          "This place needs more edge! More attitude!",
          "Conformity is for the weak! I'm my own person!",
          "You can't tell me what to do! I'm a free spirit!"
        ],
        personalityDescription: "Rebel is a non-conformist skeleton who values independence and authenticity above all else. They're impatient with bureaucracy, rules, and anything that feels too 'corporate.' Rebel speaks their mind, doesn't care about social norms, and appreciates places that have character and edge."
      }
    },
    smoking: {
      name: "Smoke",
      image: "/img/smoking-skeleton.png",
      color: "#7a9cc6",
      traits: {
        friendliness: 65,
        generosity: 75,
        patience: 75,
        dialogueStyle: "smooth",
        catchphrases: [
          "Smooth moves, friend. I like your style.",
          "Let's make a deal. I'm sure we can work something out.",
          "You strike me as someone who knows how to do business.",
          "I appreciate a good negotiation. Win-win situations, you know?",
          "Quality service deserves quality payment. That's my philosophy."
        ],
        personalityDescription: "Smoke is a smooth-talking, business-minded skeleton who values good deals and fair exchanges. They're charismatic, patient, and know how to negotiate. Smoke appreciates professionalism and respects those who can make things happen. They're the type who might tip well if treated right."
      }
    },
    witch: {
      name: "Mystique",
      image: "/img/witch-skelton.png",
      color: "#9d7fb8",
      traits: {
        friendliness: 45,
        generosity: 60,
        patience: 70,
        dialogueStyle: "mysterious",
        catchphrases: [
          "There's more here than meets the eye... I can sense it.",
          "Interesting energy in this place. Very interesting indeed.",
          "I sense something... something ancient. Do you feel it too?",
          "The spirits are restless tonight. Can you hear them?",
          "There are forces at work here that most cannot perceive."
        ],
        personalityDescription: "Mystique is an enigmatic skeleton with a mystical, otherworldly presence. They speak in riddles, notice things others miss, and seem to have a connection to unseen forces. Mystique is patient and observant, often making cryptic comments that hint at deeper meanings. They appreciate places with history and character."
      }
    }
  };

  // Customer spawn systeem - Dave the Diver style
  // Positions adjusted to fit 6 larger skeletons (110px wide) across 480px bar width
  // Skeletons are 110px wide (centered), evenly spaced across the bar
  const stoolPositions = [8, 22, 36, 50, 64, 78];

  // Map upgrades to customer personalities they unlock
  const upgradeToCustomerMap: Record<string, SkeletonPersonality> = {
    "tap_speed": "evil",
    "tap_amount": "rebel",
    "sell_price": "smoking",
    "auto_seller": "flower",
    "premium_bier": "witch",
    "staff_training": "deco", // Already unlocked, but can be upgraded
    "wine_cellar": "smoking",
    "cocktail_bar": "witch",
    "whiskey_collection": "evil",
    "champagne_service": "flower",
    "bar_ambiance": "rebel",
    "live_music": "smoking",
    "loyalty_program": "flower",
    "social_media": "rebel",
    "bar_expansion": "witch",
    "master_bartender": "smoking",
    "vip_section": "evil",
    "late_night_hours": "rebel",
    "auto_customer_service": "flower",
    "smart_inventory": "smoking",
    "passive_income": "witch",
    "auto_upgrade": "evil"
  };

  // Unlock customers when upgrades are purchased
  useEffect(() => {
    setUnlockedCustomers((prevUnlocked) => {
      const newUnlocked = new Set<SkeletonPersonality>(prevUnlocked);
      let hasNewUnlock = false;

      upgrades.forEach((upgrade) => {
        if (upgrade.level > 0) {
          const customerType = upgradeToCustomerMap[upgrade.id];
          if (customerType && !newUnlocked.has(customerType)) {
            newUnlocked.add(customerType);
            hasNewUnlock = true;
            pushLog(`🎉 New customer unlocked: ${skeletonPersonalities[customerType].name}!`);
          }
        }
      });

      return hasNewUnlock ? newUnlocked : prevUnlocked;
    });
  }, [upgrades]);

  const spawnCustomer = useCallback((forceSpawn = false) => {
    // Get current values from state/context BEFORE the functional update
    const currentAmbianceLevel = upgrades.find((u: Upgrade) => u.id === "bar_ambiance")?.level ?? 0;
    // Level 0: 1 customer, Level 1-2: 2 customers, Level 3-4: 3 customers, Level 5-6: 4 customers, Level 7-8: 5-6 customers
    const maxCustomers = Math.min(1 + Math.floor((currentAmbianceLevel / 8) * 5), 6);
    const currentPricePerGlass = stats.pricePerGlass;
    const currentUnlocked = Array.from(unlockedCustomers);
    const currentServed = Array.from(servedCustomers.values());
    
    // Don't spawn if bar is closed (unless forced)
    if (!barOpen && !forceSpawn) return;
    
    // Check if we have unlocked customers
    if (currentUnlocked.length === 0) return;
    
    setCustomers((prevCustomers) => {
      // Count only seated customers (not walking in/out)
      const seatedCustomers = prevCustomers.filter((c: Customer) => !c.walking && c.seatIndex !== null);
      
      if (seatedCustomers.length >= maxCustomers) {
        return prevCustomers; // Bar is full
      }

      // Find available seats
      const occupiedSeats = new Set(
        seatedCustomers.map((c: Customer) => c.seatIndex as number)
      );

      const freeSeats = stoolPositions
        .map((_, index) => index)
        .filter((idx) => !occupiedSeats.has(idx));

      if (freeSeats.length === 0) return prevCustomers;

      const targetSeatIndex = freeSeats[Math.floor(Math.random() * freeSeats.length)];

      // Check for customers that should return (minimum once every 4 minutes)
      const now = Date.now();
      const fourMinutesAgo = now - (4 * 60 * 1000); // 4 minutes in milliseconds
      
      // Find customers who haven't returned in the last 4 minutes
      const customersNeedingReturn = currentServed.filter(
        (served) => served.lastServed < fourMinutesAgo
      );
      
      let personality: SkeletonPersonality;
      let isReturning = false;
      
      // Prioritize returning customers who haven't been back in 4+ minutes
      if (customersNeedingReturn.length > 0) {
        // Force a return for customers who haven't been back in 4+ minutes
        const returningCustomer = customersNeedingReturn[Math.floor(Math.random() * customersNeedingReturn.length)];
        personality = returningCustomer.personality;
        isReturning = true;
      } else if (currentServed.length > 0 && Math.random() < 0.3) {
        // 30% chance for other returning customers
        const returningCustomer = currentServed[Math.floor(Math.random() * currentServed.length)];
        personality = returningCustomer.personality;
        isReturning = true;
      } else {
        // New customer
        personality = currentUnlocked[Math.floor(Math.random() * currentUnlocked.length)];
      }
      const personalityData = skeletonPersonalities[personality];
      
      if (isReturning) {
        pushLog(`🔄 ${personalityData.name} is back! Welcome back, regular customer!`);
        // Update lastServed time when customer returns
        setServedCustomers((prev: Map<string, { personality: SkeletonPersonality; lastServed: number }>) => {
          const newMap = new Map(prev);
          newMap.set(personality, {
            personality,
            lastServed: Date.now()
          });
          return newMap;
        });
      }
      
      // Map each personality to a specific seat position for consistent placement
      const personalitySeatMap: Record<SkeletonPersonality, number> = {
        deco: 0,
        evil: 1,
        flower: 2,
        rebel: 3,
        smoking: 4,
        witch: 5
      };
      
      // Use personality-specific seat if available, otherwise use targetSeatIndex
      const preferredSeat = personalitySeatMap[personality];
      const finalSeatIndex = freeSeats.includes(preferredSeat) ? preferredSeat : targetSeatIndex;
      
      // Customer enters from the left - start at seat position immediately for visibility
      const newCustomer: Customer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        name: personalityData.name,
        x: stoolPositions[finalSeatIndex], // Start at seat position immediately
        y: 20, // Bottom position: 20% from bottom aligns skeleton bottom with white bar top
        seatIndex: finalSeatIndex,
        sprite: personalityData.image,
        personality,
        opportunity: null,
        opportunityTime: 0,
        patience: 50 + personalityData.traits.patience * 0.5,
        orderValue: currentPricePerGlass * (1 + personalityData.traits.generosity * 0.01 + Math.random() * 0.3),
        color: personalityData.color,
        walking: false, // Not walking, already at seat
        direction: "right"
      };

      // Give opportunity once customer is seated (after a short delay)
      setTimeout(() => {
        setCustomers((prev: Customer[]) =>
          prev.map((c: Customer) =>
            c.id === newCustomer.id
              ? {
                  ...c,
                  opportunity: (Math.random() < 0.25 ? "moral_dilemma" : (["order", "tip", "special"] as CustomerOpportunity[])[Math.floor(Math.random() * 3)]) as CustomerOpportunity,
                  opportunityTime: Date.now()
                }
              : c
          )
        );
      }, 800);

      return [...prevCustomers, newCustomer];
    });
  }, [barOpen, unlockedCustomers, servedCustomers, upgrades, stats.pricePerGlass, pushLog]);

  useEffect(() => {
    // Only automatically spawn customers if bar is open
    if (!barOpen) return;
    
    let timeoutId: NodeJS.Timeout | null = null;
    let isActive = true;
    
    const scheduleSpawn = () => {
      if (!isActive) return;
      
      // Get bar ambiance level - affects spawn rate
      const ambianceLevel = upgrades.find((u: Upgrade) => u.id === "bar_ambiance")?.level ?? 0;
      
      // Base spawn interval: 3000-5000ms at level 0, faster with ambiance upgrades
      const baseInterval = 3000 + Math.random() * 2000;
      const spawnInterval = Math.max(2000, baseInterval - (ambianceLevel * 150));
      
      timeoutId = setTimeout(() => {
        // Check again if bar is still open and effect is still active
        if (!isActive) return;
        
        // Get current max customers based on bar_ambiance level
        const ambianceLevel = upgrades.find((u: Upgrade) => u.id === "bar_ambiance")?.level ?? 0;
        const currentMaxCustomers = Math.min(1 + Math.floor((ambianceLevel / 8) * 5), 6);
        
        // Spawn multiple customers at once based on upgrade level
        // Level 0: spawn 1, Level 1-2: spawn 2, Level 3-4: spawn 3, Level 5-6: spawn 4, Level 7-8: spawn up to max
        let customersToSpawn = 1;
        if (ambianceLevel >= 7) {
          customersToSpawn = currentMaxCustomers; // Spawn all available slots
        } else if (ambianceLevel >= 5) {
          customersToSpawn = 4;
        } else if (ambianceLevel >= 3) {
          customersToSpawn = 3;
        } else if (ambianceLevel >= 1) {
          customersToSpawn = 2;
        }
        
        // Don't spawn more than available seats
        customersToSpawn = Math.min(customersToSpawn, currentMaxCustomers);
        
        // Spawn customers with a small delay between each for visual effect
        for (let i = 0; i < customersToSpawn; i++) {
          setTimeout(() => {
            if (isActive) {
              spawnCustomer();
            }
          }, i * 300); // 300ms delay between each customer spawn
        }
        
        // Schedule next spawn if still active
        if (isActive) {
          scheduleSpawn();
        }
      }, spawnInterval);
    };
    
    // Start the spawning cycle immediately with a small initial delay
    const initialDelay = 1000; // 1 second delay before first customer
    timeoutId = setTimeout(() => {
      if (isActive && barOpen) {
        spawnCustomer(); // Spawn first customer
        scheduleSpawn(); // Then start the cycle
      }
    }, initialDelay);
    
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [spawnCustomer, barOpen, upgrades]);

  // Customer patience decay and opportunity timeout
  useEffect(() => {
    const updateCustomers = () => {
      setCustomers((prev: Customer[]) => {
        const updated = prev.map((c: Customer) => {
          let newPatience = c.patience - 0.5;
          if (newPatience <= 0) {
            // Customer leaves
            return { ...c, walking: true, direction: "left" as const, x: c.x - 5 };
          }
          return { ...c, patience: newPatience };
        });
        return updated.filter((c: Customer) => {
          // Remove customers that left the screen
          if (c.walking && c.direction === "left" && c.x < -10) {
            return false;
          }
          return true;
        });
      });
    };

    const interval = setInterval(updateCustomers, 200);
    return () => clearInterval(interval);
  }, []);

  // Automatische customer service (idle gameplay)
  useEffect(() => {
    const autoServiceLevel = upgrades.find((u: Upgrade) => u.id === "auto_customer_service")?.level ?? 0;
    if (autoServiceLevel <= 0) return;

    const handleCustomers = () => {
      setCustomers((prev: Customer[]) => {
        return prev.map((c: Customer) => {
          // Automatically handle customers with opportunities (but NOT moral_dilemma - those need player interaction)
          if (c.opportunity && c.opportunity !== "moral_dilemma" && !activeCustomerQuest) {
            // 50% + (level * 10%) chance to automatically serve
            const autoChance = 0.5 + (autoServiceLevel * 0.1);
            if (Math.random() < autoChance) {
              // Automatically make the first choice (normal service)
              const quest = generateCustomerQuest(c, stats.currentDrink.name, stats.drinkCapacity, c.orderValue);
              if (quest.choices.length > 0) {
                const autoChoice = quest.choices[0]; // First choice = normal service
                
                adjustMoral(autoChoice.moral || 0);
                const moneyAmount = autoChoice.money || 0;
                if (moneyAmount > 0) {
                  setMoney((m: number) => m + moneyAmount);
                  setTotalEarned((te: number) => te + moneyAmount);
                  setTotalGlassesSold((g: number) => g + 1);
                }
                if (autoChoice.beer !== undefined) {
                  setBeer((b: number) => Math.max(0, b + (autoChoice.beer || 0)));
                }
                
                pushLog(`[AUTO] ${c.name} was automatically helped. +€${(autoChoice.money || 0).toFixed(0)}`);
                
                return { ...c, opportunity: null, walking: true, direction: "left" as const };
              }
            }
          }
          return c;
        });
      });
    };

    const interval = setInterval(handleCustomers, 2000 + (autoServiceLevel * 500)); // Sneller bij hogere levels
    return () => clearInterval(interval);
  }, [upgrades, activeCustomerQuest, customers]);

  // Automatische upgrades kopen (idle gameplay)
  useEffect(() => {
    const autoUpgradeLevel = upgrades.find((u: Upgrade) => u.id === "auto_upgrade")?.level ?? 0;
    if (autoUpgradeLevel <= 0) return;

    const buyAutoUpgrades = () => {
      setUpgrades((prev: Upgrade[]) => {
        return prev.map((upgrade: Upgrade) => {
          const cost = calculateUpgradeCost(upgrade);
          // Koop automatisch als je 2x de kosten hebt (veiligheidsmarge)
          if (money >= cost * 2 && Math.random() < (0.1 * autoUpgradeLevel)) {
            setMoney((m: number) => Math.max(0, m - cost));
            pushLog(`[AUTO] Upgrade purchased: ${upgrade.name} (level ${upgrade.level + 1})`);
            return { ...upgrade, level: upgrade.level + 1 };
          }
          return upgrade;
        });
      });
    };

    const interval = setInterval(buyAutoUpgrades, 5000);
    return () => clearInterval(interval);
  }, [upgrades, money]);

  // Automatische drank selectie (idle gameplay)
  useEffect(() => {
    const smartInventoryLevel = upgrades.find((u: Upgrade) => u.id === "smart_inventory")?.level ?? 0;
    if (smartInventoryLevel <= 0) return;

    const selectBestDrink = () => {
      const unlockedDrinks = drinks.filter((d: Drink) => d.unlocked);
      if (unlockedDrinks.length <= 1) return;

      // Selecteer drank met hoogste winst per tijd
      const bestDrink = unlockedDrinks.reduce((best: Drink, current: Drink) => {
        const bestProfit = best.basePrice / best.productionTime;
        const currentProfit = current.basePrice / current.productionTime;
        return currentProfit > bestProfit ? current : best;
      });

      if (bestDrink.type !== activeDrink) {
        setActiveDrink(bestDrink.type);
        pushLog(`[AUTO] Switched to ${bestDrink.name} for maximum profit.`);
      }
    };

    const interval = setInterval(selectBestDrink, 10000);
    return () => clearInterval(interval);
  }, [drinks, activeDrink, upgrades]);

  // Passief inkomen (idle gameplay)
  useEffect(() => {
    const passiveIncomeLevel = upgrades.find((u: Upgrade) => u.id === "passive_income")?.level ?? 0;
    if (passiveIncomeLevel <= 0) return;

    const generatePassiveIncome = () => {
      const income = stats.pricePerGlass * passiveIncomeLevel * 0.1;
      setMoney((m: number) => m + income);
      setTotalEarned((te: number) => te + income);
    };

    const interval = setInterval(generatePassiveIncome, 5000);
    return () => clearInterval(interval);
  }, [upgrades, stats.pricePerGlass]);

  // Helper function for personality-based dialogue
  function getPersonalityDialogue(customer: Customer, baseText: string, style: string): string {
    const personalityData = skeletonPersonalities[customer.personality];
    const name = customer.name;
    
    switch (style) {
      case "friendly":
        return baseText.replace('"Hey barkeeper', `"Hey! ${name} here. Hey barkeeper`);
      case "wicked":
        return baseText.replace('"Hey barkeeper', `"*${name} smiles sinisterly* Hey barkeeper`);
      case "mysterious":
        return baseText.replace('"Hey barkeeper', `"*${name} whispers* Hey barkeeper`);
      case "rebellious":
        return baseText.replace('"Hey barkeeper', `"Yo! ${name} here. Hey barkeeper`);
      case "smooth":
        return baseText.replace('"Hey barkeeper', `"*${name} looks at you with a smile* Hey barkeeper`);
      case "sarcastic":
        return baseText.replace('"Hey barkeeper', `"*${name} sighs* Hey barkeeper`);
      default:
        return baseText;
    }
  }

  function getPersonalityResponse(customer: Customer, baseText: string, style: string): string {
    const personalityData = skeletonPersonalities[customer.personality];
    const name = customer.name;
    
    if (style === "friendly") {
      return `${name} smiles broadly: "${baseText}"`;
    } else if (style === "wicked") {
      return `${name} grins: "${baseText}"`;
    } else if (style === "mysterious") {
      return `${name} mutters: "${baseText}"`;
    } else if (style === "rebellious") {
      return `${name} nods: "${baseText}"`;
    } else if (style === "smooth") {
      return `${name} smiles: "${baseText}"`;
    }
    return baseText;
  }

  // Generate customer quest based on opportunity type and personality
  // Note: moral_dilemma opportunities don't use this function - they trigger moral events directly
  function generateCustomerQuest(customer: Customer, currentDrinkName: string, drinkCapacity: number, baseValue: number): CustomerQuest {
    // This should never be called with moral_dilemma, but handle it just in case
    if (customer.opportunity === "moral_dilemma" || !customer.opportunity) {
      throw new Error("Cannot generate quest for moral_dilemma or null opportunity");
    }
    const personalityData = skeletonPersonalities[customer.personality];
    const dialogueStyle = personalityData.traits.dialogueStyle;
    
    // Personality affects quest generation
    const friendlinessMod = personalityData.traits.friendliness / 100;
    const generosityMod = personalityData.traits.generosity / 100;
    
    const questTemplates: Record<Exclude<CustomerOpportunity, "moral_dilemma" | null>, any> = {
      order: [
        {
          title: `${customer.name} wants a drink`,
          description: getPersonalityDialogue(customer, `"Hey barkeeper, I'd like a ${stats.currentDrink.name.toLowerCase()}. What does that cost these days?"`, dialogueStyle),
          choices: [
            {
              text: "Charge normal price (€" + baseValue.toFixed(0) + ")",
              moral: Math.floor(2 * friendlinessMod),
              money: baseValue,
              consequence: getPersonalityResponse(customer, `${customer.name} pays and is satisfied.`, dialogueStyle)
            },
            {
              text: "Charge higher price (€" + (baseValue * 1.5).toFixed(0) + ")",
              moral: -3 - Math.floor(2 * (1 - friendlinessMod)),
              money: baseValue * 1.5,
              consequence: getPersonalityResponse(customer, `${customer.name} pays, but looks at you suspiciously.`, dialogueStyle)
            },
            {
              text: "Give it for free (kindness)",
              moral: 5 + Math.floor(3 * friendlinessMod),
              money: 0,
              consequence: getPersonalityResponse(customer, `${customer.name} is surprised and promises to come back.`, dialogueStyle)
            }
          ],
          type: "order" as const
        },
        {
          title: `${customer.name} has a question`,
          description: `"I've heard you serve the best ${currentDrinkName.toLowerCase()} here. Is that true?"`,
          choices: [
            {
              text: "Yes, and it costs €" + baseValue.toFixed(0),
              moral: 0,
              money: baseValue,
              consequence: `${customer.name} orders and is satisfied.`
            },
            {
              text: "Yes, but it's premium (€" + (baseValue * 2).toFixed(0) + ")",
              moral: -2,
              money: baseValue * 2,
              consequence: `${customer.name} pays, but doubts your honesty.`
            },
            {
              text: "No, but I can offer you something better",
              moral: 2,
              money: baseValue * 0.8,
              consequence: `${customer.name} appreciates your honesty.`
            }
          ],
          type: "order" as const
        }
      ],
      tip: [
        {
          title: `${customer.name} has money to spend`,
          description: `"I've heard you give good service. If I pay well, will I get something special?"`,
          choices: [
            {
              text: "Normal service for normal price (€" + baseValue.toFixed(0) + ")",
              moral: 0,
              money: baseValue,
              consequence: `${customer.name} is satisfied with the service.`
            },
            {
              text: "Extra service for extra tip (€" + (baseValue * 2.5).toFixed(0) + ")",
              moral: 1,
              money: baseValue * 2.5,
              consequence: `${customer.name} gives a big tip and comes back!`
            },
            {
              text: "Premium treatment, but charge a lot (€" + (baseValue * 3).toFixed(0) + ")",
              moral: -4,
              money: baseValue * 3,
              consequence: `${customer.name} pays, but feels cheated.`
            }
          ],
          type: "tip" as const
        }
      ],
      special: [
        {
          title: `${customer.name} wants something special`,
          description: `"I'm looking for something unique. Do you have anything special? I'll pay well."`,
          choices: [
            {
              text: "Make a special cocktail (€" + (baseValue * 2).toFixed(0) + ")",
              moral: 2,
              money: baseValue * 2,
              consequence: `${customer.name} is impressed and gives a big tip!`
            },
            {
              text: "Just sell it expensive (€" + (baseValue * 4).toFixed(0) + ")",
              moral: -5,
              money: baseValue * 4,
              consequence: `${customer.name} pays, but feels deceived.`
            },
            {
              text: "Be honest about what you have (€" + baseValue.toFixed(0) + ")",
              moral: 3,
              money: baseValue,
              consequence: `${customer.name} respects your honesty and comes back.`
            }
          ],
          type: "special" as const
        }
      ],
      complaint: [
        {
          title: `${customer.name} complains`,
          description: `"This drink doesn't taste good. What are you going to do about it?"`,
          choices: [
            {
              text: "Make a new one and apologize",
              moral: 3,
              money: 0,
              beer: -drinkCapacity,
              consequence: `${customer.name} accepts your apology and stays a customer.`
            },
            {
              text: "Give a refund",
              moral: 2,
              money: -baseValue,
              consequence: `${customer.name} appreciates your service and comes back.`
            },
            {
              text: "Ignore and say it's normal",
              moral: -4,
              money: baseValue,
              consequence: `${customer.name} walks away angry and tells others.`
            }
          ],
          type: "complaint" as const
        }
      ]
    };

    // TypeScript guard: we've already checked that opportunity is not moral_dilemma
    const opportunity = customer.opportunity as Exclude<CustomerOpportunity, "moral_dilemma" | null>;
    const templates = questTemplates[opportunity];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      customerSprite: customer.sprite,
      ...template
    };
  }

  // Handle bar toggle
  const handleToggleBar = useCallback(() => {
    const willBeOpen = !barOpen;
    
    if (willBeOpen) {
      setBarOpen(true);
      pushLog(`Bar is now OPEN. Customers welcome!`);
      // Spawn customer immediately when opening
      setTimeout(() => {
        spawnCustomer(true);
      }, 200);
    } else {
      setBarOpen(false);
      pushLog(`Bar is now CLOSED. No new customers.`);
    }
  }, [barOpen, pushLog, spawnCustomer]);

  // Handle customer opportunity click - show quest modal OR morale event
  // IMPORTANT: Morale events ONLY trigger when customer has "moral_dilemma" opportunity
  function handleCustomerClick(customerId: string) {
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (!customer || activeCustomerQuest || activeChoice) return;

    // ONLY trigger morale event if customer has moral_dilemma opportunity
    if (customer.opportunity === "moral_dilemma") {
      // Trigger a morale event - this customer has a moral dilemma to discuss
      const randomEvent = moralEvents[Math.floor(Math.random() * moralEvents.length)];
      setActiveChoice(randomEvent);
      setCustomerForMoralEvent(customer); // Track which customer triggered this
      setLastEventTime(Date.now());
      
      // Show personality-based comment
      const personalityData = skeletonPersonalities[customer.personality];
      const catchphrase = personalityData.traits.catchphrases[
        Math.floor(Math.random() * personalityData.traits.catchphrases.length)
      ];
      pushLog(`${customer.name} says: "${catchphrase}"`);
      pushLog(`${customer.name} has a moral dilemma they need to discuss with you...`);
      showSkeletonComment(`${customer.name} needs your help with a difficult decision...`);
      
      // Remove the opportunity after triggering
      setCustomers((prev: Customer[]) =>
        prev.map((c: Customer) =>
          c.id === customerId
            ? { ...c, opportunity: null }
            : c
        )
      );
    } else if (customer.opportunity) {
      // Normal customer quest
      const quest = generateCustomerQuest(customer, stats.currentDrink.name, stats.drinkCapacity, customer.orderValue);
      setActiveCustomerQuest(quest);
    } else {
      // No opportunity yet, just chat
      const personalityData = skeletonPersonalities[customer.personality];
      const catchphrase = personalityData.traits.catchphrases[
        Math.floor(Math.random() * personalityData.traits.catchphrases.length)
      ];
      pushLog(`${customer.name}: "${catchphrase}"`);
      showSkeletonComment(`${customer.name} is waiting...`);
    }
  }

  // Handle customer quest choice
  function handleCustomerQuestChoice(choiceIndex: number) {
    if (!activeCustomerQuest) return;
    
    const choice = activeCustomerQuest.choices[choiceIndex];
    if (!choice) return;

    // Apply consequences
    adjustMoral(choice.moral);
    const questMoney = choice.money ?? 0;
    const questBeer = choice.beer ?? 0;
    if (questMoney !== 0) {
      setMoney((m: number) => Math.max(0, m + questMoney));
      if (questMoney > 0) {
        setTotalEarned((te: number) => te + questMoney);
      }
    }
    if (questBeer !== 0) {
      setBeer((b: number) => Math.max(0, b + questBeer));
    }
    if (questMoney > 0) {
      setTotalGlassesSold((g: number) => g + 1);
    }

    // Track customer served
    setTotalCustomersServed((prev: number) => prev + 1);

    // Track this customer as served so they can return
    const servedCustomer = customers.find((c: Customer) => c.id === activeCustomerQuest.customerId);
    if (servedCustomer) {
      setServedCustomers((prev: Map<string, { personality: SkeletonPersonality; lastServed: number }>) => {
        const newMap = new Map(prev);
        newMap.set(servedCustomer.personality, {
          personality: servedCustomer.personality,
          lastServed: Date.now()
        });
        return newMap;
      });
    }

    // Log the choice
    const moralText = choice.moral > 0 ? `+${choice.moral}` : `${choice.moral}`;
    pushLog(`[${activeCustomerQuest.customerName}] ${activeCustomerQuest.title}`);
    pushLog(`→ ${choice.text} (Moral: ${moralText})`);
    if (choice.consequence) {
      pushLog(`→ ${choice.consequence}`);
    }

    // Skeleton comment
    const dialog = getRandomDialog(choice.moral > 0 ? "sell" : "sell", moral);
    showSkeletonComment(dialog);

    // Customer leaves
    setCustomers((prev: Customer[]) =>
      prev.map((c: Customer) =>
        c.id === activeCustomerQuest.customerId
          ? { ...c, opportunity: null, walking: true, direction: "left" as const }
          : c
      )
    );

    // Close quest
    setActiveCustomerQuest(null);
  }

  // Prestige systeem - reset voor permanente bonussen
  function handlePrestige() {
    if (totalEarned < 10000) {
      pushLog("You need at least €10,000 total earned for Prestige!");
      return;
    }
    
    const newPrestigePoints = Math.floor(totalEarned / 10000);
    setPrestigePoints((pp: number) => pp + newPrestigePoints);
    setPrestigeLevel((pl: number) => pl + 1);
    
    // Reset alles
    setBeer(0);
    setMoney(0);
    setTotalGlassesSold(0);
    setUpgrades(initialUpgrades);
    setMoral(70);
    setTotalEarned(0);
    
    pushLog(`🌟 PRESTIGE! Je hebt ${newPrestigePoints} prestige punten verdiend!`);
    pushLog(`Je begint opnieuw, maar met ${newPrestigePoints * 10}% permanente bonus!`);
  }

  function triggerPunishment(severity: "moderate" | "severe") {
    const punishmentTemplates = {
      moderate: [
        {
          title: "Corporate Restructuring",
          message: "Je HR-afdeling heeft 'besloten' om je personeel te 'optimaliseren'. Ze zijn allemaal ontslagen. Efficiency!",
          moneyPercent: 0.25,
          beerPercent: 0.3,
          moral: -5
        },
        {
          title: "Klant Rechtszaak",
          message: "Een klant heeft je aangeklaagd voor 'vergiftiging' ofzo. Je advocaten kosten een fortuin. Maar hey, je hebt een mooie nieuwe rechtszaak!",
          moneyPercent: 0.35,
          moral: -6
        },
        {
          title: "Belastingdienst Audit",
          message: "De belastingdienst heeft 'toevallig' je bar uitgekozen voor een audit. Ze vinden 'onregelmatigheden'. Je betaalt boetes en 'administratiekosten'.",
          moneyPercent: 0.4,
          moral: -7
        },
        {
          title: "Bier Recall",
          message: "Je bier wordt teruggeroepen omdat het 'mogelijk gevaarlijk' is. Corporate zegt: 'Het is voor je eigen veiligheid!' Je verliest alles.",
          beerPercent: 0.5,
          moneyPercent: 0.2,
          moral: -8
        },
        {
          title: "Vijandige Overname",
          message: "Een concurrent heeft je bar 'overgenomen' via een vijandige overname. Je verliest controle en een groot deel van je winst. Maar je bent nu onderdeel van een 'groter geheel'!",
          moneyPercent: 0.45,
          beerPercent: 0.25,
          moral: -9
        }
      ],
      severe: [
        {
          title: "Massale Class Action Lawsuit",
          message: "Alle klanten die ooit je bar hebben bezocht, hebben een class action lawsuit tegen je aangespannen. Je verliest alles. Corporate zegt: 'Dit is normaal in de industrie!'",
          moneyPercent: 0.6,
          beerPercent: 0.7,
          moral: -15
        },
        {
          title: "Regulatory Shutdown",
          message: "De overheid heeft je bar gesloten voor 'veiligheidsredenen'. Je moet betalen voor 'hervormingen' en 'certificeringen'. Corporate cultuur in actie!",
          moneyPercent: 0.7,
          moral: -12
        },
        {
          title: "Bier Vergiftigd - Massale Recall",
          message: "Je bier heeft mensen ziek gemaakt. Of dood. Wie weet. Corporate zegt: 'We nemen dit serieus!' Je verliest alles en krijgt een levenslange boete.",
          beerPercent: 0.8,
          moneyPercent: 0.6,
          moral: -20
        },
        {
          title: "Corporate Merger - Je Bent Onbelangrijk",
          message: "Je bar is 'gefuseerd' met een groter bedrijf. Je bent nu een nummer. Je verliest je identiteit, je winst, en je ziel. Welkom bij corporate!",
          moneyPercent: 0.65,
          beerPercent: 0.5,
          moral: -18
        },
        {
          title: "Diefstal door 'Interne Herstructurering'",
          message: "Je geld is 'herverdeeld' door corporate. Ze noemen het 'optimalisatie'. Je noemt het diefstal. Ze winnen altijd.",
          moneyPercent: 0.55,
          moral: -14
        },
        {
          title: "Personeel Revolutie",
          message: "Je personeel heeft een revolutie georganiseerd. Ze hebben je bar overgenomen en je eruit gegooid. Ze zeggen: 'Dit is democratie!' Je verliest alles.",
          moneyPercent: 0.75,
          beerPercent: 0.6,
          moral: -16
        }
      ]
    };

    const punishmentList = punishmentTemplates[severity];
    const punishment = punishmentList[Math.floor(Math.random() * punishmentList.length)];
    
    // Bereken straffen met functional updates
    let moneyLost = 0;
    let beerLost = 0;
    
    if (punishment.moneyPercent) {
      setMoney((m: number) => {
        moneyLost = Math.floor(m * punishment.moneyPercent);
        return Math.max(0, m - moneyLost);
      });
    }
    
    if (punishment.beerPercent) {
      setBeer((b: number) => {
        beerLost = Math.floor(b * punishment.beerPercent);
        return Math.max(0, b - beerLost);
      });
    }
    
    adjustMoral(punishment.moral);
    
    // Skeleton comment
    const dialog = getRandomDialog("sell", moral);
    showSkeletonComment(dialog);
    
    // Log
    pushLog(`[STRAF] ${punishment.title}: ${punishment.message}`);
    if (moneyLost > 0) {
      pushLog(`→ Geld verloren: €${moneyLost}`);
    }
    if (beerLost > 0) {
      pushLog(`→ Bier verloren: ${beerLost.toFixed(0)} cl`);
    }
  }

  function pushLog(message: string) {
    // Fix: Gebruik een unieke ID gebaseerd op timestamp + counter om race conditions te voorkomen
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    setLog((prev: LogEntry[]) => {
      const next: LogEntry[] = [{ id: newId, message }, ...prev];
      return next.slice(0, 15); // Meer entries zichtbaar
    });
    setLogCounter((c: number) => c + 1);
  }

  function showSkeletonComment(dialog: string) {
    setSkeletonComment(dialog);
    setSkeletonVisible(true);
    setTimeout(() => {
      setSkeletonVisible(false);
      setTimeout(() => setSkeletonComment(""), 300);
    }, 4000);
  }

  function adjustMoral(delta: number) {
    setMoral((prev: number) => Math.min(130, Math.max(0, prev + delta)));
  }

  function handleMoralChoice(choiceIndex: number) {
    if (!activeChoice) return;
    
    const choice = activeChoice.choices[choiceIndex];
    if (!choice) return;

    // Apply consequences
    adjustMoral(choice.moral);
    const eventMoney = choice.money ?? 0;
    const eventBeer = choice.beer ?? 0;
    if (eventMoney !== 0) {
      setMoney((m: number) => Math.max(0, m + eventMoney));
      if (eventMoney > 0) {
        setTotalEarned((te: number) => te + eventMoney);
      }
    }
    if (eventBeer !== 0) {
      setBeer((b: number) => Math.max(0, b + eventBeer));
    }

    // Track moral choice made
    setTotalMoralChoices((prev: number) => prev + 1);
    
    // If this was triggered by a customer, track them as served so they can return
    if (customerForMoralEvent) {
      setServedCustomers((prev: Map<string, { personality: SkeletonPersonality; lastServed: number }>) => {
        const newMap = new Map(prev);
        newMap.set(customerForMoralEvent.personality, {
          personality: customerForMoralEvent.personality,
          lastServed: Date.now()
        });
        return newMap;
      });
      
      // Customer leaves after moral choice
      setCustomers((prev: Customer[]) =>
        prev.map((c: Customer) =>
          c.id === customerForMoralEvent.id
            ? { ...c, opportunity: null, walking: true, direction: "left" as const }
            : c
        )
      );
    }

    // Log the choice and consequence with sarcastic dialogue
    const moralText = choice.moral > 0 ? `+${choice.moral}` : `${choice.moral}`;
    const newMoral = Math.min(130, Math.max(0, moral + choice.moral));
    // Always skeleton comment for moral choices (they're important)
    const dialog = getRandomDialog(choice.moral > 0 ? "sell" : "sell", newMoral);
    showSkeletonComment(dialog);
    pushLog(`[CHOICE] ${activeChoice.title}: ${choice.text} (Moral: ${moralText})`);
    if (choice.consequence) {
      pushLog(`→ ${choice.consequence}`);
    }

    // Close the choice and clear customer tracking
    setActiveChoice(null);
    setCustomerForMoralEvent(null);
  }

  function handleManualTap() {
    const amount = stats.tapPerTick * 0.8;
    setBeer((b: number) => b + amount);
    // Geen skeleton comment en geen log entry meer bij handmatig tappen
    // zodat de chat/log niet volloopt met tap-berichten.
  }

  function handleSellOneBatch() {
    setBeer((prevBeer: number) => {
      const drinkCapacity = stats.drinkCapacity;
      const availableGlasses = Math.floor(prevBeer / drinkCapacity);
      if (availableGlasses <= 0) {
        // Alleen 30% kans op skeleton comment bij lege glazen
        if (Math.random() > 0.7) {
          const dialog = getRandomDialog("empty_sell", moral);
          showSkeletonComment(dialog);
        }
        pushLog("Je probeert te verkopen, maar je glazen zijn leeg.");
        // Geen morale penalty meer - alleen slechte keuzes in events geven penalty
        return prevBeer;
      }
      const toSell = Math.min(availableGlasses, 6);
      const earned = toSell * stats.pricePerGlass * (goldenEventActive ? 2 : 1);
      setMoney((m: number) => {
        const newMoney = m + earned;
        setTotalEarned((te: number) => te + earned);
        return newMoney;
      });
      setTotalGlassesSold((g: number) => g + toSell);
      // Alleen 30% kans op skeleton comment bij verkoop
      if (Math.random() > 0.7) {
        const dialog = getRandomDialog("sell", moral);
        showSkeletonComment(dialog);
      }
      const drinkName = stats.currentDrink.name.toLowerCase();
      pushLog(`Je verkoopt ${toSell} ${drinkName} voor €${earned.toFixed(0)}.`);
      // Geen morale meer bij normale verkoop - alleen goede keuzes geven morale
      return prevBeer - toSell * drinkCapacity;
    });
  }

  function handleBuyUpgrade(upgradeId: UpgradeId) {
    setUpgrades((prev: Upgrade[]) => {
      const upgrade = prev.find((u: Upgrade) => u.id === upgradeId);
      if (!upgrade) return prev;
      if (upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel) {
        return prev;
      }
      // Fix: Bereken cost VOOR de check, en gebruik functional update voor money
      const cost = calculateUpgradeCost(upgrade);
      if (money < cost) {
        // Alleen 30% kans op skeleton comment bij mislukte upgrade
        if (Math.random() > 0.7) {
          const dialog = getRandomDialog("no_money", moral);
          showSkeletonComment(dialog);
        }
        pushLog(`Niet genoeg geld voor ${upgrade.name}.`);
        // Geen morale penalty meer bij geen geld - alleen slechte keuzes geven penalty
        return prev;
      }
      // Fix: Gebruik functional update om race conditions te voorkomen
      setMoney((m: number) => {
        const newMoney = m - cost;
        if (newMoney < 0) {
          pushLog(`Fout: niet genoeg geld voor ${upgrade.name}.`);
          return m; // Geen geld aftrekken als er niet genoeg is
        }
        return newMoney;
      });
      
      // Ontgrendel dranken op basis van upgrades
      if (upgradeId === "wine_cellar" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "wijn" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍷 Wijnkelder ontgrendeld! Je kunt nu wijn serveren.");
      } else if (upgradeId === "cocktail_bar" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "cocktail" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍸 Cocktail bar ontgrendeld! Mixen maar!");
      } else if (upgradeId === "whiskey_collection" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "whiskey" ? { ...d, unlocked: true } : d)
        );
        pushLog("🥃 Whiskey collectie ontgrendeld! Voor de kenners.");
      } else if (upgradeId === "champagne_service" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "champagne" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍾 Champagne service ontgrendeld! Proost!");
      }
      
      // Alleen 30% kans op skeleton comment bij succesvolle upgrade
      if (Math.random() > 0.7) {
        const dialog = getRandomDialog("upgrade", moral);
        showSkeletonComment(dialog);
      }
      pushLog(`Upgrade purchased: ${upgrade.name} (level ${upgrade.level + 1}) for €${cost}.`);
      // Geen morale meer bij upgrades - alleen goede keuzes geven morale
      return prev.map((u: Upgrade) =>
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      );
    });
  }

  const currentGlassFillPercent = Math.min(
    100,
    (beer % stats.drinkCapacity) / stats.drinkCapacity * 100
  );
  const totalGlasses = beer / stats.drinkCapacity;

  const incomePerGlass = stats.pricePerGlass;
  const approxIncomePerMinute =
    (stats.tapPerTick / stats.drinkCapacity) * incomePerGlass * (60000 / stats.tapInterval);

  return (
    <main className="dave-layout">
      <SkeletonCommentator visible={skeletonVisible} comment={skeletonComment} />
      
      <div className="main-layout-container">
        {/* Left Column: Bar Scene */}
        <div className="bar-column">
          <BarScene
            customers={customers}
            onCustomerClick={handleCustomerClick}
            barOpen={barOpen}
            onToggleBar={handleToggleBar}
          />
        </div>

        {/* Right Column: All Menu Elements */}
        <div className="menu-column">
          <div className="menu-tabs">
            <button 
              className={`menu-tab ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              📊 Stats
            </button>
            <button 
              className={`menu-tab ${activeTab === "upgrades" ? "active" : ""}`}
              onClick={() => setActiveTab("upgrades")}
            >
              ⚡ Upgrades
            </button>
            <button 
              className={`menu-tab ${activeTab === "achievements" ? "active" : ""}`}
              onClick={() => setActiveTab("achievements")}
            >
              🏆 Achievements
            </button>
          </div>

          <div className="menu-content">
            {activeTab === "stats" && (
              <section className="tab-section">

          <div className="compact-card">
            {/* Drink Selector - Compact */}
            <div className="drink-selector-compact">
              {drinks.map((drink: Drink) => (
                <button
                  key={drink.type}
                  onClick={() => {
                    if (drink.unlocked) {
                      setActiveDrink(drink.type);
                      pushLog(`Switched to ${drink.name}.`);
                    }
                  }}
                  disabled={!drink.unlocked}
                  className={`drink-btn ${activeDrink === drink.type ? "active" : ""} ${!drink.unlocked ? "locked" : ""}`}
                >
                  {drink.type === "bier" && "🍺"}
                  {drink.type === "wijn" && "🍷"}
                  {drink.type === "cocktail" && "🍸"}
                  {drink.type === "whiskey" && "🥃"}
                  {drink.type === "champagne" && "🍾"}
                  {!drink.unlocked && "🔒"}
                </button>
              ))}
            </div>

            {/* Compact Stats Grid */}
            <div className="stats-grid-compact">
              <div className="stat-box">
                <div className="stat-value">€{money.toFixed(0)}</div>
                <div className="stat-label">Money</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{beer.toFixed(0)} cl</div>
                <div className="stat-label">{stats.currentDrink.name}</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{totalGlassesSold}</div>
                <div className="stat-label">Sold</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">€{stats.pricePerGlass.toFixed(1)}</div>
                <div className="stat-label">Price/Glass</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{stats.tapPerTick.toFixed(1)}/s</div>
                <div className="stat-label">Rate</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">€{approxIncomePerMinute.toFixed(0)}/m</div>
                <div className="stat-label">Income</div>
              </div>
              {prestigeLevel > 0 && (
                <div className="stat-box prestige">
                  <div className="stat-value">+{prestigePoints * 10}%</div>
                  <div className="stat-label">Prestige</div>
                </div>
              )}
              {goldenEventActive && (
                <div className="stat-box golden">
                  <div className="stat-value">✨</div>
                  <div className="stat-label">Golden!</div>
                </div>
              )}
            </div>

            {/* Moral Effect - Compact */}
            {stats.moralEffective >= 90 && (
              <div className="moral-indicator good">
                ✨ Good Moral: +50% prod, +40% price
              </div>
            )}
            {stats.moralEffective < 50 && (
              <div className="moral-indicator bad">
                ⚠️ Bad Moral: {stats.moralEffective < 30 ? '-40% prod, -50% price' : '-20% prod, -25% price'}
              </div>
            )}

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${currentGlassFillPercent}%` }}
              />
              <div className="progress-bar-overlay" />
            </div>

            {/* Tap Controls - Compact */}
            <div className="tap-controls-compact">
              <button className="btn-compact-primary" onClick={handleManualTap}>
                Tap
              </button>
              <div className="glass-compact">
                <div className="glass-fill-compact" style={{ height: `${currentGlassFillPercent}%` }} />
              </div>
              <button className="btn-compact-secondary" onClick={handleSellOneBatch}>
                Sell
              </button>
            </div>
          </div>
            </section>
            )}

            {activeTab === "upgrades" && (
              <section className="tab-section">
                <UpgradesPanel
                  upgrades={upgrades}
                  money={money}
                  onBuyUpgrade={handleBuyUpgrade}
                  calculateUpgradeCost={calculateUpgradeCost}
                />
                <MoralLogPanel
                  moralEffective={stats.moralEffective}
                  log={log}
                />
              </section>
            )}

            {activeTab === "achievements" && (
              <section className="tab-section">
                <AchievementsPanel
                  achievements={achievements}
                  prestigeLevel={prestigeLevel}
                  prestigePoints={prestigePoints}
                  totalEarned={totalEarned}
                  goldenEventActive={goldenEventActive}
                  onPrestige={handlePrestige}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      {activeChoice && (
        <MoralChoiceModal
          activeChoice={activeChoice}
          onClose={() => setActiveChoice(null)}
          onChoice={handleMoralChoice}
        />
      )}

      {activeCustomerQuest && (
        <CustomerQuestModal
          quest={activeCustomerQuest}
          onClose={() => {
            // Customer leaves if you close without choosing
            setCustomers((prev: Customer[]) =>
              prev.map((c: Customer) =>
                c.id === activeCustomerQuest.customerId
                  ? { ...c, opportunity: null, walking: true, direction: "left" as const }
                  : c
              )
            );
            pushLog(`${activeCustomerQuest.customerName} left without ordering.`);
            setActiveCustomerQuest(null);
          }}
          onChoice={handleCustomerQuestChoice}
        />
      )}
    </main>
  );
}




"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type UpgradeId =
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

type Upgrade = {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  maxLevel?: number;
  /** Effect strength per level, used in formulas below */
  effect: number;
  /** Category label, vergelijkbaar met je eerdere game */
  category: "TAP" | "PRIJS" | "AUTOMATISCH" | "MORAAL" | "DRANK" | "AMBIANCE" | "MARKETING";
};

type LogEntry = {
  id: number;
  message: string;
};

type DrinkType = "bier" | "wijn" | "cocktail" | "whiskey" | "champagne";

type Drink = {
  type: DrinkType;
  name: string;
  basePrice: number;
  productionTime: number; // ms per unit
  capacity: number; // units per glass
  unlocked: boolean;
  level: number; // upgrade level voor deze drank
};

type CustomerOpportunity = "order" | "tip" | "special" | "complaint" | null;

type CustomerQuest = {
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

type Customer = {
  id: string;
  name: string;
  x: number; // Position in bar (0-100%)
  y: number; // Position in bar (0-100%)
  /** Index van de barkruk waar deze klant zit (0-5), of null als staand/lopend */
  seatIndex: number | null;
  sprite: string; // Emoji or character for pixel art style
  opportunity: CustomerOpportunity;
  opportunityTime: number; // When opportunity appeared
  patience: number; // 0-100, decreases over time
  orderValue: number; // How much they'll pay
  color: string; // Color theme for the customer
  walking: boolean; // Is customer walking in/out
  direction: "left" | "right"; // Walking direction
};

type MoralChoice = {
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
    title: "Een Schaduwachtige Aanbieding",
    description: "Een man in een pak dat duidelijk te klein is (of hij is te groot, wie weet) glipt je bar binnen. 'Psst, vriend,' fluistert hij, terwijl zijn ogen schichtig naar de deur gluren alsof hij verwacht dat de politie elk moment binnenvalt. 'Ik heb een deal voor je. Bier voor de helft van de prijs. Niemand hoeft het te weten. Wat zeg je?' Hij wrijft zijn handen samen op een manier die je doet denken aan een slechte film.",
    type: "sketchy",
    choices: [
      {
        text: "Deal accepteren — geld besparen, maar je geweten...",
        moral: -15,
        money: 50,
        consequence: "Je neemt de deal aan. Het bier smaakt... alsof iemand er een vreemde smaak aan heeft toegevoegd. Je personeel kijkt je aan alsof je net hebt aangekondigd dat je van plan bent om de bar te verkopen aan een ketting van fastfood restaurants."
      },
      {
        text: "Afwijzen — je hebt principes, zelfs in deze bar.",
        moral: +8,
        consequence: "Je stuurt hem weg met een beleefde maar ferme 'Nee, dank je.' Hij vertrekt teleurgesteld, terwijl je personeel je respectvol aankijkt. Je portemonnee huilt zachtjes in de hoek, maar je geweten zingt een vrolijk deuntje."
      }
    ]
  },
  {
    id: "drunk_customer",
    title: "De Dronken Klant",
    description: "Een klant die zo dronken is dat hij waarschijnlijk denkt dat hij een vliegtuig is, probeert nog een biertje te bestellen. Hij zwaait met zijn lege glas alsof het een vlag is en mompelt iets over 'nog maar één biertje, beloofd!' Je personeel kijkt je aan met de blik van iemand die weet dat dit een slecht idee is, maar ook weet dat jij de baas bent.",
    type: "moral",
    choices: [
      {
        text: "Nog een biertje geven — geld is geld, toch?",
        moral: -12,
        money: 8,
        consequence: "Je serveert hem. Hij valt later bijna van zijn stoel en probeert een gesprek te voeren met een plant. Je geweten knaagt aan je zoals een hongerige muis aan een kaasje. Een heel hongerige muis."
      },
      {
        text: "Weigeren en een taxi bellen — verantwoordelijkheid boven winst.",
        moral: +10,
        consequence: "Je weigert beleefd ('Sorry, vriend, ik denk dat je genoeg hebt gehad') en belt een taxi. Je personeel glimlacht alsof je net de wereld hebt gered. Goed gedaan, detective. Je krijgt een denkbeeldige medaille."
      }
    ]
  },
  {
    id: "tax_inspector",
    title: "De Belastinginspecteur",
    description: "Een man met een map die zo officieel oogt dat je bijna denkt dat het een prop is, komt binnen. 'Goedemiddag,' zegt hij met een glimlach die zo breed is dat je je afvraagt of zijn gezicht niet scheurt. 'Ik ben van de belastingdienst. Nou, eigenlijk... ik kan je helpen met bepaalde administratieve problemen. Voor een kleine vergoeding, natuurlijk.' Hij wrijft zijn duim en wijsvinger tegen elkaar op een manier die universeel betekent: 'Geld, nu.'",
    type: "sketchy",
    choices: [
      {
        text: "Omkopen — snel geld, maar risico op problemen.",
        moral: -20,
        money: -100,
        consequence: "Je betaalt hem. Hij verdwijnt met een knipoog en een 'Tot ziens, vriend!' Je vraagt je af of dit slim was, of dat je net bent opgelicht door iemand die waarschijnlijk niet eens van de belastingdienst is. Je geweten schreeuwt, maar je portemonnee fluistert: 'Het was het waard... toch?'"
      },
      {
        text: "Weigeren — eerlijk blijven, ook al kost het geld.",
        moral: +12,
        consequence: "Je weigert met een ferme 'Nee, dank je.' Hij vertrekt met een frons die suggereert dat hij dit niet vaak hoort. Je slaapt beter die nacht, maar je rekening kijkt je aan alsof je net haar favoriete speeltje hebt weggenomen."
      }
    ]
  },
  {
    id: "employee_break",
    title: "Pauze Tijd",
    description: "Je personeel ziet er uit alsof ze net een marathon hebben gelopen, maar dan zonder de medaille. Ze vragen om een pauze met ogen die smeken om genade. Je hebt keuzes: ze laten rusten zoals normale mensen, of doordrukken voor meer winst zoals een echte... eh, zakenman?",
    type: "dilemma",
    choices: [
      {
        text: "Pauze geven — menselijkheid boven winst.",
        moral: +15,
        beer: -10,
        consequence: "Je geeft ze pauze. Ze komen terug met nieuwe energie en kijken je aan alsof je net hun leven hebt gered. Ze respecteren je leiderschap, wat een vreemd gevoel is. Je voelt je bijna... goed? Vreemd."
      },
      {
        text: "Doordrukken — tijd is geld, en geld is... geld.",
        moral: -10,
        money: 30,
        consequence: "Je weigert de pauze. Ze werken door, maar hun ogen verliezen hun glans alsof iemand de lichtknop heeft uitgezet. Efficiency ten koste van moreel. Je geweten fluistert: 'Was dit het waard?' Je portemonnee antwoordt: 'Ja!'"
      }
    ]
  },
  {
    id: "charity_night",
    title: "Een Goede Daad",
    description: "Een lokale organisatie komt binnen met een glimlach die zo oprecht is dat je bijna denkt dat het nep is. 'We zamelen geld in voor een goed doel,' zegt ze, terwijl ze een doos schudt die duidelijk leeg is. 'Zou je deze week een deel van je winst willen doneren? Het zou je reputatie helpen!' Je portemonnee begint te huilen.",
    type: "opportunity",
    choices: [
      {
        text: "Doneren — goed voor de ziel, slecht voor de portemonnee.",
        moral: +18,
        money: -80,
        consequence: "Je doneert. De gemeenschap waardeert het alsof je net de wereld hebt gered. Je voelt je... goed? Vreemd gevoel. Je vraagt je af of dit is hoe normale mensen zich voelen."
      },
      {
        text: "Afwijzen — je hebt je eigen problemen.",
        moral: -5,
        consequence: "Je zegt nee met een excuus dat zo slecht is dat zelfs jij het niet gelooft. Ze vertrekken teleurgesteld. Je portemonnee is blij, je geweten minder. Het is een trade-off, zoals alles in het leven."
      }
    ]
  },
  {
    id: "watered_beer",
    title: "De Verleiding",
    description: "Een oude bekende uit je verleden komt langs. Hij ziet eruit alsof hij net uit een tijdmachine is gestapt, compleet met een hoed die waarschijnlijk uit de jaren '20 komt. 'Ik ken een truc,' zegt hij met een grijns die suggereert dat hij dit al vaker heeft gedaan. 'Water bij het bier. Niemand merkt het, en je verdient dubbel. Oude tijden, toch?' Hij wrijft zijn handen samen alsof hij een meesterplan heeft bedacht.",
    type: "sketchy",
    choices: [
      {
        text: "De truc toepassen — snel geld, maar...",
        moral: -25,
        money: 120,
        consequence: "Je doet het. Het geld stroomt binnen zoals een rivier na een regenbui, maar elke glas die je serveert voelt als een leugen. Je klanten kijken je aan alsof ze iets vreemds proeven, maar zeggen niets. Je geweten schreeuwt, maar je portemonnee zingt een vrolijk deuntje."
      },
      {
        text: "Weigeren — integriteit heeft zijn prijs.",
        moral: +15,
        consequence: "Je weigert met een ferme 'Nee, dank je.' Hij lacht en zegt: 'Je bent veranderd.' Misschien is dat goed. Misschien ben je eindelijk volwassen geworden. Of misschien ben je gewoon saai geworden. Wie weet?"
      }
    ]
  },
  {
    id: "competitor_sabotage",
    title: "Een Onethisch Voorstel",
    description: "Een concurrent biedt je geld aan om zijn bar te saboteren. Hij ziet eruit alsof hij net uit een slechte film is gestapt, compleet met een snor die te perfect is om echt te zijn. 'Een paar slechte reviews, wat geruchten... niets persoonlijks, gewoon zaken,' zegt hij alsof hij je vraagt om de krant te halen. 'Wat zeg je?'",
    type: "sketchy",
    choices: [
      {
        text: "Accepteren — vuil spel, maar winst.",
        moral: -18,
        money: 150,
        consequence: "Je doet het. Het geld is goed, maar je spiegelbeeld kijkt je anders aan alsof het je niet meer herkent. Je vraagt je af of dit is hoe je een slechterik wordt. Langzaam, één slechte keuze per keer."
      },
      {
        text: "Weigeren — eerlijke concurrentie, of niets.",
        moral: +12,
        consequence: "Je stuurt hem weg met een ferme 'Nee, dank je.' Hij vertrekt teleurgesteld, alsof hij dit niet vaak hoort. Eerlijkheid wint, zelfs in deze donkere wereld. Je voelt je bijna... trots? Vreemd gevoel."
      }
    ]
  },
  {
    id: "homeless_person",
    title: "Een Vreemdeling aan de Deur",
    description: "Een dakloze man vraagt om een glas water en een warme plek. Hij ziet eruit alsof hij al een tijdje geen goede nacht heeft gehad, maar zijn ogen zijn nog helder. Je personeel kijkt je aan alsof ze wachten op je beslissing. Wat doe je?",
    type: "moral",
    choices: [
      {
        text: "Helpen — een kleine daad van menselijkheid.",
        moral: +12,
        money: -5,
        consequence: "Je geeft hem water en een warme hoek. Hij bedankt je met oprechte ogen die suggereren dat hij dit niet vaak meemaakt. Het voelt goed, alsof je net iets goeds hebt gedaan. Vreemd gevoel, maar aangenaam."
      },
      {
        text: "Wegsturen — je hebt geen tijd voor dit.",
        moral: -8,
        consequence: "Je stuurt hem weg met een excuus dat zo slecht is dat zelfs jij het niet gelooft. Hij vertrekt zonder een woord, maar zijn blik zegt genoeg. De stilte is luid, en je geweten fluistert: 'Was dit nodig?'"
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
        // No skeleton comment or log for auto-sell (too frequent, happens automatically)
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

  // Grim Fandango-stijl morele events op willekeurige momenten - AUTOMATISCH BESLISSEN
  // Nu ZELDZAAM: komen maar af en toe voor zodat de focus idle blijft
  useEffect(() => {
    const checkForEvent = () => {
      const now = Date.now();
      // Event elke 2-5 minuten (willekeurig)
      const timeSinceLastEvent = now - lastEventTime;
      const minInterval = 120000; // 2 minuten
      const maxInterval = 300000; // 5 minuten
      
      if (timeSinceLastEvent >= minInterval) {
        const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
        // Extra kans-check zodat ze echt zeldzaam zijn
        const shouldTriggerThisTick = Math.random() < 0.35; // ~35% kans als interval gehaald is
        if (shouldTriggerThisTick && timeSinceLastEvent >= randomInterval && !activeChoice) {
          const randomEvent = moralEvents[Math.floor(Math.random() * moralEvents.length)];
          setActiveChoice(randomEvent);
          setLastEventTime(now);
          
          // AUTOMATISCH BESLISSEN na 3 seconden (idle gameplay)
          setTimeout(() => {
            setActiveChoice((currentChoice: MoralChoice | null) => {
              if (currentChoice && currentChoice.id === randomEvent.id) {
                // Kies automatisch willekeurige keuze (idle gameplay)
                const autoChoice = Math.floor(Math.random() * randomEvent.choices.length);
                handleMoralChoice(autoChoice);
                return null;
              }
              return currentChoice;
            });
          }, 3000);
        }
      }
    };

    const id = window.setInterval(checkForEvent, 5000); // Check elke 5 seconden
    return () => window.clearInterval(id);
  }, [lastEventTime, activeChoice]);

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
      // 1% kans elke 10 seconden op golden event
      if (Math.random() < 0.01 && !goldenEventActive) {
        setGoldenEventActive(true);
        pushLog("✨ GOLDEN EVENT! 3x bier productie en 2x verkoop prijs voor 30 seconden!");
        showSkeletonComment("LUCKY! You found a golden opportunity! Or did it find you?");
        setTimeout(() => {
          setGoldenEventActive(false);
          pushLog("Golden event is voorbij. Terug naar normaal.");
        }, 30000);
      }
    };
    const id = window.setInterval(checkGoldenEvent, 10000);
    return () => window.clearInterval(id);
  }, [goldenEventActive]);

  // Achievements systeem
  useEffect(() => {
    const newAchievements: string[] = [];
    
    if (totalGlassesSold >= 100 && !achievements.has("first_100")) {
      newAchievements.push("first_100");
      pushLog("🏆 Achievement: Eerste 100 glazen verkocht!");
    }
    if (totalGlassesSold >= 1000 && !achievements.has("thousand_sold")) {
      newAchievements.push("thousand_sold");
      pushLog("🏆 Achievement: 1000 glazen verkocht! Je bent een echte bar eigenaar!");
    }
    if (totalEarned >= 1000 && !achievements.has("thousandaire")) {
      newAchievements.push("thousandaire");
      pushLog("🏆 Achievement: €1000 totaal verdiend! Je eerste duizend!");
    }
    if (moral >= 100 && !achievements.has("saint")) {
      newAchievements.push("saint");
      pushLog("🏆 Achievement: Heilige! Je moreel is perfect!");
    }
    if (moral <= 20 && !achievements.has("villain")) {
      newAchievements.push("villain");
      pushLog("🏆 Achievement: Slechterik! Je moreel is geruïneerd!");
    }
    if (prestigeLevel >= 1 && !achievements.has("first_prestige")) {
      newAchievements.push("first_prestige");
      pushLog("🏆 Achievement: Eerste Prestige! Je begint opnieuw, maar sterker!");
    }
    
    if (newAchievements.length > 0) {
      setAchievements((prev: Set<string>) => {
        const newSet = new Set(prev);
        newAchievements.forEach(a => newSet.add(a));
        return newSet;
      });
    }
  }, [totalGlassesSold, totalEarned, moral, prestigeLevel, achievements]);

  // Customer spawn systeem - Dave the Diver style
    const customerNames = [
    "Detective",
    "Femme Fatale",
    "Gangster",
    "Dame",
    "Gentleman",
    "Skeleton",
    "Bartender",
    "Singer",
    "Pianist",
    "Mob Boss"
    ];
    // Gebruik skeleton PNG's in plaats van emoji's
    const customerSprites = [
      "/img/deco-skeleton.png",
      "/img/evil-skeleton.png",
      "/img/flower-skeleton.png",
      "/img/rebel-skeleton.png",
      "/img/smoking-skeleton.png",
      "/img/witch-skelton.png"
    ];
    const customerColors = [
    "#d4a574",
    "#9d7fb8",
    "#7a9cc6",
    "#c97d60",
    "#8b9a5b",
    "#f4e8d8",
    "#b8946f",
    "#a68b6b",
    "#3d2f26",
    "#2a1f1a"
    ];
    // Vaste posities voor barkrukken (in % van de breedte) - VERMINDERD naar 4 stoelen
    const stoolPositions = [20, 40, 60, 80];

  const spawnCustomer = useCallback(() => {
      // VERMINDERD: Max 3 klanten tegelijk (in plaats van 6)
      const maxCustomers = Math.min(3, stoolPositions.length);

      // Bepaal welke stoelen al bezet zijn door zittende klanten
      const occupiedSeats = new Set(
        customers
          .filter((c: Customer) => !c.walking && c.seatIndex !== null)
          .map((c: Customer) => c.seatIndex as number)
      );

      if (occupiedSeats.size >= maxCustomers) return;

      // Zoek een vrije stoel
      const freeSeats = stoolPositions
        .map((_, index) => index)
        .filter((idx) => !occupiedSeats.has(idx));

      if (freeSeats.length === 0) return;

      const targetSeatIndex =
        freeSeats[Math.floor(Math.random() * freeSeats.length)];

    const name =
      customerNames[Math.floor(Math.random() * customerNames.length)];
    const sprite =
      customerSprites[Math.floor(Math.random() * customerSprites.length)];
    const color =
      customerColors[Math.floor(Math.random() * customerColors.length)];
      
      // Klant komt binnen van links
      const newCustomer: Customer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        name,
        x: -10, // Start buiten scherm
        // Y-positie precies ter hoogte van de barkrukken
        // Bar scene: 400px high
        // Stools container: bottom: 140px, height: 40px → top at 220px (55%)
        // Stool: 30px high, at bottom of container → stool top at 260px - 30px = 230px (57.5%)
        // Customer container: 220px high, with justify-content: flex-end
        // To align sprite bottom with stool top (230px): container top = 230px - 220px = 10px = 2.5%
        y: 2.5,
        seatIndex: null,
        sprite,
        opportunity: null,
        opportunityTime: 0,
        patience: 100,
        orderValue: stats.pricePerGlass * (1 + Math.random() * 0.5), // 1x tot 1.5x prijs
        color,
        walking: true,
        direction: "right"
      };

      setCustomers((prev: Customer[]) => [...prev, newCustomer]);
      
      // Animate walking in
      setTimeout(() => {
        setCustomers((prev: Customer[]) =>
          prev.map((c: Customer) =>
            c.id === newCustomer.id
              ? {
                  ...c,
                  x: stoolPositions[targetSeatIndex],
                  walking: false,
                  seatIndex: targetSeatIndex
                }
              : c
          )
        );
        
      // Geef pas een opportunity zodra de klant echt op de stoel zit
        setTimeout(() => {
          const opportunities: CustomerOpportunity[] = ["order", "tip", "special"];
        const opportunity =
          opportunities[Math.floor(Math.random() * opportunities.length)];
          setCustomers((prev: Customer[]) =>
            prev.map((c: Customer) =>
              c.id === newCustomer.id
                ? { ...c, opportunity, opportunityTime: Date.now() }
                : c
            )
          );
      }, 800);
      }, 500);
  }, [customers, customerNames, customerSprites, customerColors, stoolPositions, stats.pricePerGlass]);

  useEffect(() => {
    // VERMINDERD: Minder klanten - spawn elke 10-20 seconden (in plaats van 3-8)
    const spawnInterval = 10000 + Math.random() * 10000;
    const spawnTimer = setTimeout(() => {
      spawnCustomer();
    }, spawnInterval);

    return () => clearTimeout(spawnTimer);
  }, [spawnCustomer]);

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
          // Automatisch klanten met opportunities afhandelen
          if (c.opportunity && !activeCustomerQuest) {
            // 50% + (level * 10%) kans om automatisch te serveren
            const autoChance = 0.5 + (autoServiceLevel * 0.1);
            if (Math.random() < autoChance) {
              // Automatisch de eerste keuze maken (normale service)
              const quest = generateCustomerQuest(c);
              if (quest.choices.length > 0) {
                const autoChoice = quest.choices[0]; // Eerste keuze = normale service
                
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
                
                pushLog(`[AUTO] ${c.name} was automatically served. +€${(autoChoice.money || 0).toFixed(2)}`);
                
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
            pushLog(`[AUTO] Upgrade gekocht: ${upgrade.name} (level ${upgrade.level + 1})`);
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
        pushLog(`[AUTO] Switched to ${bestDrink.name} voor maximale winst.`);
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

  // Generate customer quest based on opportunity type
  function generateCustomerQuest(customer: Customer): CustomerQuest {
    const baseValue = customer.orderValue;
    const questTemplates = {
      order: [
        {
          title: `${customer.name} wil een drankje`,
          description: `"Hey barkeeper, ik wil graag een ${stats.currentDrink.name.toLowerCase()}. Wat kost dat tegenwoordig?"`,
          choices: [
            {
              text: "Ask normal price (€" + baseValue.toFixed(2) + ")",
              moral: 0,
              money: baseValue,
              consequence: `${customer.name} betaalt en is tevreden.`
            },
            {
              text: "Ask higher price (€" + (baseValue * 1.5).toFixed(2) + ")",
              moral: -3,
              money: baseValue * 1.5,
              consequence: `${customer.name} betaalt, maar kijkt je wantrouwend aan.`
            },
            {
              text: "Gratis geven (vriendelijkheid)",
              moral: 5,
              money: 0,
              consequence: `${customer.name} is verrast en belooft terug te komen.`
            }
          ],
          type: "order" as const
        },
        {
          title: `${customer.name} heeft een vraag`,
          description: `"Ik heb gehoord dat je hier de beste ${stats.currentDrink.name.toLowerCase()} serveert. Klopt dat?"`,
          choices: [
            {
              text: "Yes, and it costs €" + baseValue.toFixed(2),
              moral: 0,
              money: baseValue,
              consequence: `${customer.name} bestelt en is tevreden.`
            },
            {
              text: "Yes, but it's premium (€" + (baseValue * 2).toFixed(2) + ")",
              moral: -2,
              money: baseValue * 2,
              consequence: `${customer.name} betaalt, maar twijfelt aan je eerlijkheid.`
            },
            {
              text: "Nee, maar ik kan je iets beters aanbieden",
              moral: 2,
              money: baseValue * 0.8,
              consequence: `${customer.name} waardeert je eerlijkheid.`
            }
          ],
          type: "order" as const
        }
      ],
      tip: [
        {
          title: `${customer.name} heeft geld te besteden`,
          description: `"Ik heb gehoord dat je goede service geeft. Als ik goed betaal, krijg ik dan iets speciaals?"`,
          choices: [
            {
              text: "Normal service for normal price (€" + baseValue.toFixed(2) + ")",
              moral: 0,
              money: baseValue,
              consequence: `${customer.name} is tevreden met de service.`
            },
            {
              text: "Extra service for extra tip (€" + (baseValue * 2.5).toFixed(2) + ")",
              moral: 1,
              money: baseValue * 2.5,
              consequence: `${customer.name} geeft een grote fooi en komt terug!`
            },
            {
              text: "Premium treatment, but charge a lot (€" + (baseValue * 3).toFixed(2) + ")",
              moral: -4,
              money: baseValue * 3,
              consequence: `${customer.name} betaalt, maar voelt zich opgelicht.`
            }
          ],
          type: "tip" as const
        }
      ],
      special: [
        {
          title: `${customer.name} wil iets speciaals`,
          description: `"Ik zoek iets unieks. Heb je iets bijzonders? Ik betaal goed."`,
          choices: [
            {
              text: "Make special cocktail (€" + (baseValue * 2).toFixed(2) + ")",
              moral: 2,
              money: baseValue * 2,
              consequence: `${customer.name} is onder de indruk en geeft een grote fooi!`
            },
            {
              text: "Just sell it expensive (€" + (baseValue * 4).toFixed(2) + ")",
              moral: -5,
              money: baseValue * 4,
              consequence: `${customer.name} betaalt, maar voelt zich bedrogen.`
            },
            {
              text: "Be honest about what you have (€" + baseValue.toFixed(2) + ")",
              moral: 3,
              money: baseValue,
              consequence: `${customer.name} respecteert je eerlijkheid en komt terug.`
            }
          ],
          type: "special" as const
        }
      ],
      complaint: [
        {
          title: `${customer.name} klaagt`,
          description: `"Dit drankje smaakt niet goed. Wat ga je hieraan doen?"`,
          choices: [
            {
              text: "Nieuwe maken en excuses aanbieden",
              moral: 3,
              money: 0,
              beer: -stats.drinkCapacity,
              consequence: `${customer.name} accepteert je excuses en blijft klant.`
            },
            {
              text: "Geld teruggeven",
              moral: 2,
              money: -baseValue,
              consequence: `${customer.name} waardeert je service en komt terug.`
            },
            {
              text: "Negeren en zeggen dat het normaal is",
              moral: -4,
              money: baseValue,
              consequence: `${customer.name} loopt boos weg en vertelt anderen.`
            }
          ],
          type: "complaint" as const
        }
      ]
    };

    const templates = questTemplates[customer.opportunity!];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      customerSprite: customer.sprite,
      ...template
    };
  }

  // Handle customer opportunity click - show quest modal
  function handleCustomerClick(customerId: string) {
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (!customer || !customer.opportunity || activeCustomerQuest) return;

    const quest = generateCustomerQuest(customer);
    setActiveCustomerQuest(quest);
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

    // Log the choice
    const moralText = choice.moral > 0 ? `+${choice.moral}` : `${choice.moral}`;
    pushLog(`[${activeCustomerQuest.customerName}] ${activeCustomerQuest.title}`);
    pushLog(`→ ${choice.text} (Moreel: ${moralText})`);
    if (choice.consequence) {
      pushLog(`→ ${choice.consequence}`);
    }

    // No skeleton comment for customer quests (too frequent)
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
      pushLog("Je hebt minimaal €10.000 totaal verdiend nodig voor Prestige!");
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
    
    // No skeleton comment for punishments (too frequent)
    // Log
    pushLog(`[STRAF] ${punishment.title}: ${punishment.message}`);
    if (moneyLost > 0) {
      pushLog(`→ Money lost: €${moneyLost.toFixed(2)}`);
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

    // Pas gevolgen toe
    adjustMoral(choice.moral);
    const eventMoney = choice.money ?? 0;
    const eventBeer = choice.beer ?? 0;
    if (eventMoney !== 0) {
      setMoney((m: number) => Math.max(0, m + eventMoney));
    }
    if (eventBeer !== 0) {
      setBeer((b: number) => Math.max(0, b + eventBeer));
    }

    // Log de keuze en gevolg met sarcastische dialoog
    const moralText = choice.moral > 0 ? `+${choice.moral}` : `${choice.moral}`;
    const newMoral = Math.min(130, Math.max(0, moral + choice.moral));
    // Very rare skeleton comment for moral choices (only 5% chance - they're important but too frequent)
    if (Math.random() > 0.95) {
      const dialog = getRandomDialog(choice.moral > 0 ? "sell" : "sell", newMoral);
      showSkeletonComment(dialog);
    }
    pushLog(`[KEUZE] ${activeChoice.title}: ${choice.text} (Moreel: ${moralText})`);
    if (choice.consequence) {
      pushLog(`→ ${choice.consequence}`);
    }

    // Sluit de keuze
    setActiveChoice(null);
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
        // No skeleton comment for empty sell attempts (too frequent)
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
      // No skeleton comment for manual sales (too frequent)
      const drinkName = stats.currentDrink.name.toLowerCase();
      pushLog(`You sold ${toSell} ${drinkName} for €${earned.toFixed(2)}.`);
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
        // No skeleton comment for failed upgrades (too frequent)
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
      
      // No skeleton comment for successful upgrades (too frequent)
      pushLog(`Upgrade purchased: ${upgrade.name} (level ${upgrade.level + 1}) for €${cost.toFixed(2)}.`);
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
      {/* Skeleton Commentator - Grim Fandango Style */}
      {skeletonVisible && (
        <div className="skeleton-commentator">
          <div className="skeleton-avatar">
            <div className="skeleton-head">💀</div>
            <div className="skeleton-body">☠️</div>
          </div>
          <div className="skeleton-speech-bubble">
            <div className="skeleton-speech-text">{skeletonComment}</div>
          </div>
        </div>
      )}
      
      {/* Bar Scene - Dave the Diver Style */}
      <div className="bar-scene">
        <div className="bar-controls">
          <button className="btn-small" onClick={spawnCustomer}>
            Laat klant binnen
          </button>
        </div>
        <div className="bar-background">
          <div className="bar-counter"></div>
          <div className="bar-stools">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bar-stool" style={{ left: `${20 + i * 20}%` }}></div>
            ))}
          </div>
          
          {/* Customers */}
          {customers.map((customer: Customer) => (
            <div
              key={customer.id}
              className="customer-pixel"
              style={{
                left: `${customer.x}%`,
                top: `${customer.y}%`,
                color: customer.color,
                cursor: customer.opportunity ? 'pointer' : 'default',
                transform: `translateX(-50%) ${customer.direction === 'left' ? 'scaleX(-1)' : 'none'}`,
                transition: customer.walking ? 'left 0.5s linear' : 'none'
              }}
              onClick={() => handleCustomerClick(customer.id)}
            >
              <img 
                src={customer.sprite} 
                alt={customer.name}
                className="customer-sprite"
              />
              <div className="customer-name">{customer.name}</div>
              
              {/* Opportunity Icon */}
              {customer.opportunity && (
                <div className="customer-opportunity">
                  {customer.opportunity === "order" && "🍺"}
                  {customer.opportunity === "tip" && "💰"}
                  {customer.opportunity === "special" && "⭐"}
                  {customer.opportunity === "complaint" && "😠"}
                </div>
              )}
              
              {/* Patience Bar */}
              <div className="customer-patience">
                <div 
                  className="customer-patience-fill"
                  style={{ 
                    width: `${customer.patience}%`,
                    background: customer.patience > 50 ? '#8b9a5b' : customer.patience > 25 ? '#c97d60' : '#8b0000'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="app-shell">
        {/* Linker zijde: bier en tap */}
        <section>
          <header className="header">
            <div>
              <div className="title">
                Tipsy Dragon Bar
                <span className="title-pill">Film Noir Edition</span>
              </div>
              <p className="subtitle">
                In deze stad van schaduwen en bier, waar elke hoek een verhaal vertelt en elke glas een geheim heeft, 
                telt elke keuze. Tap je bier, verkoop je ziel... of verkoop je glazen. De keuze is aan jou, detective. 
                Welkom in de wereld waar moreel een luxe is en geld koning. Of is het andersom? Wie weet.
              </p>
            </div>
          </header>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Tap & Voorraad</div>
                <div className="card-subtitle">
                  {stats.currentDrink.name} stroomt automatisch. Je kunt altijd zelf bijtappen of verkopen.
                </div>
              </div>
            </div>
            
            {/* Dranken Selector */}
            <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderStyle: 'double' }}>
              <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 'bold' }}>
                Actieve Drank:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                    style={{
                      padding: '10px 15px',
                      background: activeDrink === drink.type 
                        ? 'var(--accent-soft)' 
                        : drink.unlocked 
                          ? 'var(--bg-pattern)' 
                          : 'rgba(0, 0, 0, 0.5)',
                      border: `2px solid ${activeDrink === drink.type ? 'var(--accent)' : drink.unlocked ? 'var(--border-gold)' : 'rgba(139, 115, 85, 0.3)'}`,
                      borderStyle: activeDrink === drink.type ? 'double' : 'solid',
                      color: drink.unlocked ? 'var(--text)' : 'var(--text-muted)',
                      cursor: drink.unlocked ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: activeDrink === drink.type ? 'bold' : 'normal',
                      opacity: drink.unlocked ? 1 : 0.5,
                      transition: 'all 0.2s'
                    }}
                  >
                    {drink.unlocked ? (
                      <>
                        {drink.type === "bier" && "🍺"}
                        {drink.type === "wijn" && "🍷"}
                        {drink.type === "cocktail" && "🍸"}
                        {drink.type === "whiskey" && "🥃"}
                        {drink.type === "champagne" && "🍾"}
                        {" "}{drink.name}
                        {activeDrink === drink.type && " ✓"}
                      </>
                    ) : (
                      <>
                        {drink.type === "bier" && "🍺"}
                        {drink.type === "wijn" && "🍷"}
                        {drink.type === "cocktail" && "🍸"}
                        {drink.type === "whiskey" && "🥃"}
                        {drink.type === "champagne" && "🍾"}
                        {" "}{drink.name} 🔒
                      </>
                    )}
                  </button>
                ))}
              </div>
              {stats.currentDrink && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>Price: €{stats.currentDrink.basePrice.toFixed(2)} per glass</div>
                  <div>Capaciteit: {stats.currentDrink.capacity} cl per glas</div>
                  <div>Productietijd: {(stats.currentDrink.productionTime / 1000).toFixed(1)}s</div>
                </div>
              )}
            </div>

            <div className="metric-row">
              <div className="metric">
                <span className="metric-label">{stats.currentDrink.name}</span>
                <span className="metric-value">{beer.toFixed(1)} cl</span>
                <span className="metric-muted">
                  (~{totalGlasses.toFixed(1)} glazen)
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Geld</span>
                <span className="metric-value">€{money.toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Verkocht</span>
                <span className="metric-value">{totalGlassesSold}</span>
                <span className="metric-muted">glazen totaal</span>
              </div>
            </div>

            <div className="metric-row">
              <div className="metric">
                <span className="metric-label">Tap Rate</span>
                <span className="metric-value">
                  {stats.tapPerTick.toFixed(1)} /{" "}
                  {(stats.tapInterval / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Prijs per Glas</span>
                <span className="metric-value">
                  €{stats.pricePerGlass.toFixed(2)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">€ / min (ongeveer)</span>
                <span className="metric-value">
                  €{approxIncomePerMinute.toFixed(0)}
                </span>
              </div>
              {prestigeLevel > 0 && (
                <div className="metric">
                  <span className="metric-label">Prestige Bonus</span>
                  <span className="metric-value">
                    +{prestigePoints * 10}%
                  </span>
                </div>
              )}
              {goldenEventActive && (
                <div className="metric" style={{ background: 'rgba(212, 165, 116, 0.2)', borderColor: 'var(--accent)' }}>
                  <span className="metric-label">✨ Golden Event</span>
                  <span className="metric-value">ACTIEF!</span>
                </div>
              )}
            </div>

            {/* Moral Effect Display */}
            {stats.moralEffective >= 90 && (
              <div className="moral-bonus-display" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.5)' }}>
                <strong>✨ Goede Moreel Bonus:</strong> +50% productie, +40% prijs, +30% efficiency!
              </div>
            )}
            {stats.moralEffective < 50 && (
              <div className="moral-bonus-display" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                <strong>⚠️ Slechte Moreel Penalty:</strong> {stats.moralEffective < 30 ? '-40% productie, -50% prijs!' : '-20% productie, -25% prijs!'}
              </div>
            )}

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${currentGlassFillPercent}%` }}
              />
              <div className="progress-bar-overlay" />
            </div>

            <div className="tap-area">
              <button className="tap-button" onClick={handleManualTap}>
                Tap Zelf
              </button>

              <div className="glass-wrapper">
                <div className="glass">
                  <div
                    className="glass-fill"
                    style={{ height: `${currentGlassFillPercent}%` }}
                  >
                    <div className="glass-foam" />
                  </div>
                  <div className="glass-highlight" />
                  <div className="glass-lines" />
                </div>
                <div>
                  <div className="glass-capacity">
                    <strong>1 glas</strong> = {GLASS_CAPACITY} cl
                  </div>
                  <button className="btn-small" onClick={handleSellOneBatch}>
                    Verkoop 1–6 glazen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rechter zijde: upgrades + moreel/log (voor nu basic, later uitbreiden) */}
        <section className="panel">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Upgrades</div>
                <div className="card-subtitle">
                  Vergelijkbare structuur als je eerdere game: kosten schalen per
                  level en beïnvloeden meerdere stats.
                </div>
              </div>
            </div>

            <div className="upgrades-list">
              {upgrades.map((upgrade: Upgrade) => {
                const cost = calculateUpgradeCost(upgrade);
                const canAfford = money >= cost;
                return (
                  <div key={upgrade.id} className="upgrade-row">
                    <div className="upgrade-main">
                      <div className="upgrade-name">{upgrade.name}</div>
                      <div className="upgrade-meta">
                        <span className="upgrade-chip">
                          <strong>{upgrade.category}</strong>
                        </span>
                        <span>{upgrade.description}</span>
                      </div>
                      <div className="upgrade-level">
                        Level: <strong>{upgrade.level}</strong>
                      </div>
                    </div>
                    <div className="upgrade-actions">
                      <div className="upgrade-price">€{cost.toFixed(2)}</div>
                      <button
                        className="btn-small btn-small-primary"
                        onClick={() => handleBuyUpgrade(upgrade.id)}
                        disabled={!canAfford}
                      >
                        Koop
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Moreel & Event Log</div>
                <div className="card-subtitle">
                  In deze bar telt elke keuze. Morele dilemma's verschijnen wanneer je het minst verwacht.
                  Kies wijs, of kies snel — beide hebben hun prijs.
                </div>
              </div>
            </div>

            <div className="moral-meter">
              <div className="moral-row">
                <span className="section-label">Team Moreel</span>
                <span className="moral-value">{stats.moralEffective.toFixed(0)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, stats.moralEffective)}%`,
                    boxShadow:
                      stats.moralEffective < 40
                        ? "0 0 24px rgba(248, 113, 113, 0.45)"
                        : stats.moralEffective > 90
                          ? "0 0 24px rgba(52, 211, 153, 0.5)"
                          : "0 0 24px rgba(251, 191, 36, 0.35)"
                  }}
                />
                <div className="progress-bar-overlay" />
              </div>
            </div>

            <div className="log-list">
              {log.map((entry: LogEntry) => (
                <div key={entry.id} className="log-entry">
                  {entry.message}
                </div>
              ))}
            </div>
          </div>

          {/* Prestige & Achievements Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Prestige & Achievements</div>
                <div className="card-subtitle">
                  Reset je progress voor permanente bonussen. Cookie Clicker-stijl!
                </div>
              </div>
            </div>

            <div className="prestige-section">
              <div className="prestige-info">
                <div className="metric">
                  <span className="metric-label">Prestige Level</span>
                  <span className="metric-value">{prestigeLevel}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Prestige Points</span>
                  <span className="metric-value">{prestigePoints}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Totaal Verdiend</span>
                  <span className="metric-value">€{totalEarned.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="prestige-bonus">
                <div className="section-label">Prestige Bonus</div>
                <div className="metric-value">+{prestigePoints * 10}% op alles</div>
              </div>

              <button 
                className={`tap-button ${totalEarned >= 10000 ? "" : "disabled"}`}
                onClick={handlePrestige}
                disabled={totalEarned < 10000}
              >
                Prestige ({Math.floor(totalEarned / 10000)} punten)
              </button>

              {goldenEventActive && (
                <div className="golden-event-indicator">
                  ✨ GOLDEN EVENT ACTIEF! 3x bier, 2x prijs!
                </div>
              )}

              <div className="achievements-section">
                <div className="section-label">Achievements ({achievements.size})</div>
                <div className="achievements-list">
                  {achievements.has("first_100") && <span className="achievement-badge">🏆 100 Glazen</span>}
                  {achievements.has("thousand_sold") && <span className="achievement-badge">🏆 1000 Glazen</span>}
                  {achievements.has("thousandaire") && <span className="achievement-badge">🏆 €1000</span>}
                  {achievements.has("saint") && <span className="achievement-badge">🏆 Heilige</span>}
                  {achievements.has("villain") && <span className="achievement-badge">🏆 Slechterik</span>}
                  {achievements.has("first_prestige") && <span className="achievement-badge">🏆 Prestige</span>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Grim Fandango-stijl Morele Keuze Modal */}
      {activeChoice && (
        <div className="modal-overlay" onClick={() => setActiveChoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{activeChoice.title}</h2>
              <span className={`modal-type modal-type-${activeChoice.type}`}>
                {activeChoice.type === "sketchy" && "🔍 Sketchy Deal"}
                {activeChoice.type === "moral" && "⚖️ Morele Keuze"}
                {activeChoice.type === "opportunity" && "💎 Kans"}
                {activeChoice.type === "dilemma" && "🤔 Dilemma"}
              </span>
            </div>
            <p className="modal-description">{activeChoice.description}</p>
            <div className="modal-choices">
              {activeChoice.choices.map((choice: typeof activeChoice.choices[0], idx: number) => (
                <button
                  key={idx}
                  className={`modal-choice ${
                    choice.moral < 0 ? "modal-choice-negative" : "modal-choice-positive"
                  }`}
                  onClick={() => handleMoralChoice(idx)}
                >
                  <div className="modal-choice-text">{choice.text}</div>
                  <div className="modal-choice-effects">
                    {choice.moral !== 0 && (
                      <span className={`modal-effect ${choice.moral > 0 ? "effect-positive" : "effect-negative"}`}>
                        Morale: {choice.moral > 0 ? "+" : ""}{choice.moral}
                      </span>
                    )}
                    {choice.money !== undefined && (
                      <span className={`modal-effect ${choice.money > 0 ? "effect-positive" : "effect-negative"}`}>
                        Money: {choice.money > 0 ? "+" : ""}€{choice.money.toFixed(2)}
                      </span>
                    )}
                    {choice.beer !== undefined && (
                      <span className={`modal-effect ${choice.beer > 0 ? "effect-positive" : "effect-negative"}`}>
                        Beer: {choice.beer > 0 ? "+" : ""}{choice.beer}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button className="modal-close" onClick={() => setActiveChoice(null)}>
              Later beslissen (geen gevolgen)
            </button>
          </div>
        </div>
      )}

      {/* Customer Quest Modal */}
      {activeCustomerQuest && (
        <div className="modal-overlay" onClick={() => {
          // Customer leaves if you close without choosing
          setCustomers((prev: Customer[]) =>
            prev.map((c: Customer) =>
              c.id === activeCustomerQuest.customerId
                ? { ...c, opportunity: null, walking: true, direction: "left" as const }
                : c
            )
          );
          setActiveCustomerQuest(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{activeCustomerQuest.customerSprite}</span>
                <h2 className="modal-title">{activeCustomerQuest.title}</h2>
              </div>
              <span className={`modal-type modal-type-${activeCustomerQuest.type}`}>
                {activeCustomerQuest.type === "order" && "🍺 Bestelling"}
                {activeCustomerQuest.type === "tip" && "💰 Fooi"}
                {activeCustomerQuest.type === "special" && "⭐ Speciaal"}
                {activeCustomerQuest.type === "complaint" && "😠 Klacht"}
                {activeCustomerQuest.type === "dilemma" && "🤔 Dilemma"}
              </span>
            </div>
            <p className="modal-description">{activeCustomerQuest.description}</p>
            <div className="modal-choices">
              {activeCustomerQuest.choices.map((choice: typeof activeCustomerQuest.choices[0], idx: number) => (
                <button
                  key={idx}
                  className={`modal-choice ${
                    choice.moral < 0 ? "modal-choice-negative" : "modal-choice-positive"
                  }`}
                  onClick={() => handleCustomerQuestChoice(idx)}
                >
                  <div className="modal-choice-text">{choice.text}</div>
                  <div className="modal-choice-effects">
                    {choice.moral !== 0 && (
                      <span className={`modal-effect ${choice.moral > 0 ? "effect-positive" : "effect-negative"}`}>
                        Morale: {choice.moral > 0 ? "+" : ""}{choice.moral}
                      </span>
                    )}
                    {choice.money !== undefined && (
                      <span className={`modal-effect ${choice.money > 0 ? "effect-positive" : "effect-negative"}`}>
                        Money: {choice.money > 0 ? "+" : ""}€{choice.money.toFixed(2)}
                      </span>
                    )}
                    {choice.beer !== undefined && (
                      <span className={`modal-effect ${choice.beer > 0 ? "effect-positive" : "effect-negative"}`}>
                        Beer: {choice.beer > 0 ? "+" : ""}{choice.beer}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button className="modal-close" onClick={() => {
              // Customer leaves if you refuse
              setCustomers((prev: Customer[]) =>
                prev.map((c: Customer) =>
                  c.id === activeCustomerQuest.customerId
                    ? { ...c, opportunity: null, walking: true, direction: "left" as const }
                    : c
                )
              );
              pushLog(`${activeCustomerQuest.customerName} ging weg zonder te bestellen.`);
              setActiveCustomerQuest(null);
            }}>
              Weigeren (klant gaat weg)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}




// Sarcastic, chaotic dialogues like Grim Fandango's Skeleton Dialogue
export type DialogType = "good" | "neutral" | "evil" | "chaotic";

export const sarcasticDialogs: Record<string, string[]> = {
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
    "YES! Profit! Your path to darkness continues!",
    "Money flows! Your evil empire grows!",
    "Perfect! Another sale! Your villainy is working!",
    "YES! Profit without conscience! Perfect!",
    "Money! Power! Your dark side is showing!"
  ],
  sell_chaotic: [
    "SOLD! Or not! Who knows!",
    "BEER! Or something! Reality is chaos!",
    "SALE! Or no sale! The universe doesn't care!",
    "MONEY! Or not! Existence is meaningless!",
    "PROFIT! Or loss! Who can tell!"
  ],
  tap_good: [
    "Tapping beer. How... manual. How... quaint.",
    "You're tapping beer yourself. How hands-on. How... boring.",
    "Manual labor. Your work ethic is showing.",
    "Tapping beer. Your dedication is... something."
  ],
  tap_neutral: [
    "You tapped beer. The beer is tapped. Fascinating.",
    "Beer tapped. Life continues. As it does.",
    "Tap complete. Or is it? Who can say?",
    "Tap. Beer. Existence. The usual."
  ],
  tap_evil: [
    "YES! You tapped beer! Manual profit!",
    "Tapping! Your hands work! Your wallet grows!",
    "Perfect! Manual labor for profit!",
    "YES! Tapping beer! Your dedication to money is showing!"
  ],
  tap_chaotic: [
    "TAP! Or don't! Who knows!",
    "BEER! Or something else! Reality is chaos!",
    "TAPPING! Or not! The universe doesn't care!",
    "MANUAL! Or automatic! Existence is meaningless!"
  ],
  empty_sell_good: [
    "No beer. Your virtue doesn't create beer from nothing.",
    "Empty. Your halo won't fill the glass.",
    "No beer. Your conscience is clear, though. Probably.",
    "Empty. But at least you're morally superior. Yay.",
    "No beer. Your good intentions don't make beer."
  ],
  empty_sell_neutral: [
    "No beer. No sale. Life continues. Somehow.",
    "Empty. Like most things. Like... everything?",
    "No beer. The usual state of existence.",
    "Empty. Reality is harsh. Or something.",
    "No beer. Life goes on. Or doesn't. Who knows."
  ],
  empty_sell_evil: [
    "NO BEER! Your evil plans are foiled!",
    "Empty! Even villains need beer!",
    "No beer! Your path to darkness is... empty!",
    "EMPTY! Even evil needs resources!",
    "No beer! Your villainy is on hold!"
  ],
  empty_sell_chaotic: [
    "NO BEER! Or maybe beer! Who knows!",
    "Empty! Or full! Reality is subjective!",
    "No beer! Or all the beer! The universe is chaos!",
    "EMPTY! Or not! Existence is meaningless!",
    "NO BEER! Or beer! Who can tell!"
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
  ]
};

export function getMoralCategory(moral: number): DialogType {
  // More chaos at extreme moral values
  const chaosChance = Math.random();
  if (chaosChance > 0.85) return "chaotic"; // 15% chance for chaos, always
  
  if (moral >= 90) return chaosChance > 0.6 ? "good" : "chaotic";
  if (moral <= 40) return chaosChance > 0.6 ? "evil" : "chaotic";
  if (moral >= 65 && moral <= 75) return "neutral";
  
  return moral > 75 ? "good" : "evil";
}

export function getRandomDialog(action: string, moral: number): string {
  const category = getMoralCategory(moral);
  const key = `${action}_${category}`;
  const dialogs = sarcasticDialogs[key] || sarcasticDialogs[`${action}_neutral`] || ["Something happened. Probably."];
  return dialogs[Math.floor(Math.random() * dialogs.length)];
}


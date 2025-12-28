import type { DialogType } from "../types";

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

export function getMoralCategory(moral: number): DialogType {
  const chaosChance = Math.random();
  if (chaosChance > 0.85) return "chaotic";
  
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

import type { MoralChoice } from "../types";

export const moralEvents: MoralChoice[] = [
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

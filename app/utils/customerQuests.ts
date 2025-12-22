import type { Customer, CustomerQuest, CustomerOpportunity } from "../types";
import { skeletonPersonalities } from "../data/skeletonPersonalities";

export function getPersonalityDialogue(customer: Customer, baseText: string, style: string): string {
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

export function getPersonalityResponse(customer: Customer, baseText: string, style: string): string {
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

export function generateCustomerQuest(
  customer: Customer,
  currentDrinkName: string,
  drinkCapacity: number,
  baseValue: number
): CustomerQuest {
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
        description: getPersonalityDialogue(customer, `"Hey barkeeper, I'd like a ${currentDrinkName.toLowerCase()}. What does that cost these days?"`, dialogueStyle),
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


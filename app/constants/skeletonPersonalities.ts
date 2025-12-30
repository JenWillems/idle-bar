import type { SkeletonPersonality } from "../types";

export const skeletonPersonalities: Record<SkeletonPersonality, {
  name: string;
  image: string;
  color: string;
  traits: {
    friendliness: number;
    generosity: number;
    patience: number;
    dialogueStyle: "sarcastic" | "friendly" | "mysterious" | "rebellious" | "smooth" | "wicked";
    catchphrases: string[];
    personalityDescription: string;
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

export const upgradeToCustomerMap: Record<string, SkeletonPersonality> = {
  "tap_speed": "evil",
  "tap_amount": "rebel",
  "sell_price": "smoking",
  "auto_seller": "flower",
  "staff_training": "deco",
  "watered_down": "evil",
  "hidden_fees": "smoking",
  "tip_stealing": "evil",
  "tax_evasion": "smoking",
  "quality_ingredients": "flower",
  "fair_wages": "deco",
  "sustainable_practices": "rebel"
};

export const stoolPositions = [8, 22, 36, 50, 64, 78];

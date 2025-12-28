import { useEffect } from "react";
import type { Drink } from "../types";

interface UseAchievementsProps {
  totalGlassesSold: number;
  totalEarned: number;
  moral: number;
  prestigeLevel: number;
  maxUpgradeLevel: number;
  totalCustomersServed: number;
  totalMoralChoices: number;
  drinks: Drink[];
  goldenEventActive: boolean;
  achievements: Set<string>;
  setAchievements: (updater: (prev: Set<string>) => Set<string>) => void;
  pushLog: (message: string) => void;
}

export function useAchievements({
  totalGlassesSold,
  totalEarned,
  moral,
  prestigeLevel,
  maxUpgradeLevel,
  totalCustomersServed,
  totalMoralChoices,
  drinks,
  goldenEventActive,
  achievements,
  setAchievements,
  pushLog
}: UseAchievementsProps) {
  useEffect(() => {
    const newAchievements: string[] = [];
    
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
    
    if (totalCustomersServed >= 50 && !achievements.has("social_bartender")) {
      newAchievements.push("social_bartender");
      pushLog("🏆 Achievement: Social Bartender! 50 customers served!");
    }
    if (totalCustomersServed >= 500 && !achievements.has("people_person")) {
      newAchievements.push("people_person");
      pushLog("🏆 Achievement: People Person! 500 customers served!");
    }
    
    if (totalMoralChoices >= 10 && !achievements.has("moral_philosopher")) {
      newAchievements.push("moral_philosopher");
      pushLog("🏆 Achievement: Moral Philosopher! 10 moral choices made!");
    }
    if (totalMoralChoices >= 50 && !achievements.has("ethical_expert")) {
      newAchievements.push("ethical_expert");
      pushLog("🏆 Achievement: Ethical Expert! 50 moral choices made!");
    }
    
    const unlockedDrinks = drinks.filter(d => d.unlocked).length;
    if (unlockedDrinks >= 3 && !achievements.has("drink_collector")) {
      newAchievements.push("drink_collector");
      pushLog("🏆 Achievement: Drink Collector! 3 different drinks unlocked!");
    }
    if (unlockedDrinks >= 5 && !achievements.has("drink_master")) {
      newAchievements.push("drink_master");
      pushLog("🏆 Achievement: Drink Master! All drinks unlocked!");
    }
    
    if (newAchievements.length > 0) {
      setAchievements((prev: Set<string>) => {
        const newSet = new Set(prev);
        newAchievements.forEach(a => newSet.add(a));
        return newSet;
      });
    }
  }, [totalGlassesSold, totalEarned, moral, prestigeLevel, maxUpgradeLevel, totalCustomersServed, totalMoralChoices, drinks.length, achievements, goldenEventActive, setAchievements, pushLog]);
}

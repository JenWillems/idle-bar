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
import { BASE_TAP_AMOUNT, BASE_SELL_INTERVAL, BASE_SELL_BATCH, STOOL_POSITIONS } from "./constants/gameConstants";
import { initialDrinks } from "./data/drinks";
import { initialUpgrades } from "./data/upgrades";
import { moralEvents } from "./data/moralEvents";
import { getRandomDialog } from "./data/dialogs";
import { skeletonPersonalities, upgradeToCustomerMap } from "./data/skeletonPersonalities";
import { generateCustomerQuest, getPersonalityDialogue, getPersonalityResponse } from "./utils/customerQuests";
import { calculateUpgradeCost } from "./utils/upgradeUtils";

export default function HomePage() {
  const [beer, setBeer] = useState(0); // raw beer units
  const [money, setMoney] = useState(0);
  const [totalGlassesSold, setTotalGlassesSold] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [activeDrink, setActiveDrink] = useState<DrinkType>("bier");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [moral, setMoral] = useState(70); // 0-130, Grim Fandango-style moral system
  const [activeChoice, setActiveChoice] = useState<MoralChoice | null>(null);
  const [activeCustomerQuest, setActiveCustomerQuest] = useState<CustomerQuest | null>(null);
  const [customerForMoralEvent, setCustomerForMoralEvent] = useState<Customer | null>(null); // Track which customer triggered moral event
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
  const [barOpen, setBarOpen] = useState(false); // Bar starts closed - customers only spawn when opened
  const [unlockedCustomers, setUnlockedCustomers] = useState<Set<SkeletonPersonality>>(new Set(["deco"])); // Start with Deco unlocked
  const [servedCustomers, setServedCustomers] = useState<Map<string, { personality: SkeletonPersonality; lastServed: number }>>(new Map()); // Track served customers for returns
  const [activeTab, setActiveTab] = useState<"stats" | "upgrades" | "achievements">("stats");

  // Helper functions - defined early so they can be used in useEffect hooks
  const pushLog = useCallback((message: string) => {
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    setLog((prev: LogEntry[]) => {
      const next: LogEntry[] = [{ id: newId, message }, ...prev];
      return next.slice(0, 15); // More entries visible
    });
  }, []);

  const showSkeletonComment = useCallback((dialog: string) => {
    setSkeletonComment(dialog);
    setSkeletonVisible(true);
    setTimeout(() => {
      setSkeletonVisible(false);
      setTimeout(() => setSkeletonComment(""), 300);
    }, 4000);
  }, []);

  const adjustMoral = useCallback((delta: number) => {
    setMoral((prev: number) => Math.min(130, Math.max(0, prev + delta)));
  }, []);

  // Derived stats based on upgrades and active drink
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
    
    // New upgrades
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

    // Drink-specific production time (slower for more expensive drinks)
    const drinkProductionTime = currentDrink.productionTime * (1 - tapSpeedLevel * 0.05);
    const tapInterval = Math.max(300, drinkProductionTime * (1 - tapSpeedLevel * 0.05));
    
    // Tap amount with drink-specific capacity
    const drinkCapacity = currentDrink.capacity;
    const tapPerTick = BASE_TAP_AMOUNT * (1 + tapAmountLevel * 0.25) * (drinkCapacity / 20);

    // Price based on drink + upgrades
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
    
    // New upgrade bonuses for auto-sell (use already declared variables)
    const improvedAutoSellInterval = autoSellInterval * (1 - bartenderLevel * 0.08 - lateNightLevel * 0.05);
    const improvedAutoSellBatch = autoSellBatch * (1 + bartenderLevel * 0.2 + expansionLevel * 0.15);

    // Fable-style: REALLY important moral effects
    // Good (90+): Large bonuses - people trust you, pay more, work harder
    // Neutral (50-90): Normal values
    // Bad (<50): Large penalties - people distrust you, pay less, work worse
    let moralMultiplier = 1.0;
    let priceMultiplier = 1.0;
    let efficiencyMultiplier = 1.0;
    
    if (moralEffective >= 90) {
      // Good: +50% production, +40% price, +30% efficiency
      moralMultiplier = 1.5;
      priceMultiplier = 1.4;
      efficiencyMultiplier = 1.3;
    } else if (moralEffective >= 70) {
      // Good enough: +25% production, +20% price, +15% efficiency
      moralMultiplier = 1.25;
      priceMultiplier = 1.2;
      efficiencyMultiplier = 1.15;
    } else if (moralEffective >= 50) {
      // Neutral: Normal values
      moralMultiplier = 1.0;
      priceMultiplier = 1.0;
      efficiencyMultiplier = 1.0;
    } else if (moralEffective >= 30) {
      // Bad: -20% production, -25% price, -15% efficiency
      moralMultiplier = 0.8;
      priceMultiplier = 0.75;
      efficiencyMultiplier = 0.85;
    } else {
      // Very bad: -40% production, -50% price, -30% efficiency
      moralMultiplier = 0.6;
      priceMultiplier = 0.5;
      efficiencyMultiplier = 0.7;
    }

    // Prestige bonuses (permanent)
    const prestigeMultiplier = 1 + (prestigePoints * 0.1); // 10% per prestige point

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

  // Calculate offline progress on mount
  useEffect(() => {
    const savedTime = localStorage.getItem('lastSaveTime');
    if (savedTime) {
      const offlineTime = Date.now() - parseInt(savedTime);
      const offlineMinutes = Math.floor(offlineTime / 60000);
      if (offlineMinutes > 1) {
        // Calculate offline progress (max 8 hours) - use base stats
        const maxOfflineMinutes = Math.min(offlineMinutes, 480);
        const baseTapPerSecond = stats.tapPerTick / (stats.tapInterval / 1000);
        const offlineBeer = baseTapPerSecond * (maxOfflineMinutes * 60);
        if (offlineBeer > 0) {
          setBeer((b: number) => b + offlineBeer);
          pushLog(`Offline progress: ${maxOfflineMinutes} minutes, +${offlineBeer.toFixed(0)} cl beer!`);
        }
      }
    }
    setLastSaveTime(Date.now());
  }, [stats.tapPerTick, stats.tapInterval]);

  // Auto-save every 10 seconds
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

  // Automatic selling (if there's at least staff)
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
        // Only 20% chance for skeleton comment on auto-sell (happens often)
        if (Math.random() > 0.8) {
          const dialog = getRandomDialog("auto_sell", moral);
          showSkeletonComment(dialog);
        }
        const drinkName = stats.currentDrink.name.toLowerCase();
        pushLog(`Your staff sold ${toSell} ${drinkName} for €${earned.toFixed(0)}.`);
        // No morale from auto-sell - only good choices give morale
        return prevBeer - toSell * drinkCapacity;
      });
    }, stats.autoSellInterval);

    return () => window.clearInterval(id);
  }, [stats.autoSellInterval, stats.autoSellBatch, stats.pricePerGlass, upgrades, goldenEventActive]);

  // Slowly shift moral toward neutral
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
      
      // At very low morale (< 20): punish much more often (every 15-25 seconds) - corporate is merciless
      // At low morale (< 40): punish regularly (every 30-45 seconds)
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

  // Golden Events (like Cookie Clicker) - random bonuses
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
    // Don't spawn if bar is closed (unless forced)
    if (!barOpen && !forceSpawn) return;
    
    setCustomers((prevCustomers) => {
      // Get bar_ambiance level to determine max customers
      const ambianceLevel = upgrades.find((u: Upgrade) => u.id === "bar_ambiance")?.level ?? 0;
      const maxCustomers = Math.min(1 + Math.floor((ambianceLevel / 8) * 5), 6);

      // Count only seated customers (not walking in/out)
      const seatedCustomers = prevCustomers.filter((c: Customer) => !c.walking && c.seatIndex !== null);
      
      if (seatedCustomers.length >= maxCustomers) {
        return prevCustomers; // Bar is full
      }

      // Find available seats
      const occupiedSeats = new Set(
        seatedCustomers.map((c: Customer) => c.seatIndex as number)
      );

      const freeSeats = STOOL_POSITIONS
        .map((_, index) => index)
        .filter((idx) => !occupiedSeats.has(idx));

      if (freeSeats.length === 0) return prevCustomers;

      // Map each personality to a specific seat (0-5) based on color/position
      // Brown/Tan (Deco) = 0, Red (Evil) = 1, Orange (Rebel) = 2, Green (Flower) = 3, Blue (Smoke) = 4, Purple (Witch) = 5
      const personalityToSeatMap: Record<SkeletonPersonality, number> = {
        "deco": 0,    // Brown/Tan - first position
        "evil": 1,    // Red - second position
        "rebel": 2,   // Orange - third position
        "flower": 3,  // Green - fourth position
        "smoking": 4, // Blue - fifth position
        "witch": 5    // Purple - sixth position
      };

      // Only use unlocked customer personalities
      const unlockedPersonalities = Array.from(unlockedCustomers);
      if (unlockedPersonalities.length === 0) return prevCustomers;
      
      // 30% chance for a returning customer if any have been served
      let personality: SkeletonPersonality;
      let isReturning = false;
      if (servedCustomers.size > 0 && Math.random() < 0.3) {
        const servedArray = Array.from(servedCustomers.values());
        const returningCustomer = servedArray[Math.floor(Math.random() * servedArray.length)];
        personality = returningCustomer.personality;
        isReturning = true;
      } else {
        personality = unlockedPersonalities[Math.floor(Math.random() * unlockedPersonalities.length)];
      }
      const personalityData = skeletonPersonalities[personality];
      
      // Get the preferred seat for this personality
      const preferredSeat = personalityToSeatMap[personality];
      
      // Try to use preferred seat if available, otherwise use any free seat
      let targetSeatIndex: number;
      if (freeSeats.includes(preferredSeat)) {
        targetSeatIndex = preferredSeat;
      } else {
        targetSeatIndex = freeSeats[Math.floor(Math.random() * freeSeats.length)];
      }
      
      if (isReturning) {
        pushLog(`🔄 ${personalityData.name} is back! Welcome back, regular customer!`);
      }
      
      const newCustomer: Customer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        name: personalityData.name,
        x: -10,
        y: 42, // Adjusted so torso aligns with white bar counter
        seatIndex: null,
        sprite: personalityData.image,
        personality,
        opportunity: null,
        opportunityTime: 0,
        patience: 50 + personalityData.traits.patience * 0.5,
        orderValue: stats.pricePerGlass * (1 + personalityData.traits.generosity * 0.01 + Math.random() * 0.3),
        color: personalityData.color,
        walking: true,
        direction: "right"
      };

      // Animate walking in
      setTimeout(() => {
        setCustomers((prev: Customer[]) =>
          prev.map((c: Customer) =>
            c.id === newCustomer.id
              ? {
                  ...c,
                  x: STOOL_POSITIONS[targetSeatIndex],
                  walking: false,
                  seatIndex: targetSeatIndex
                }
              : c
          )
        );
        
        // Give opportunity once customer is seated
        setTimeout(() => {
          const isMoralDilemma = Math.random() < 0.25;
          const opportunity: CustomerOpportunity = isMoralDilemma 
            ? "moral_dilemma"
            : (["order", "tip", "special"] as CustomerOpportunity[])[Math.floor(Math.random() * 3)];
          
          setCustomers((prev: Customer[]) =>
            prev.map((c: Customer) =>
              c.id === newCustomer.id
                ? { ...c, opportunity, opportunityTime: Date.now() }
                : c
            )
          );
        }, 800);
      }, 500);

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
        
        // Always spawn 1 customer at a time (max customers is controlled by spawnCustomer function)
        spawnCustomer();
        
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
  // Helper functions are imported from ./utils/customerQuests

  // Handle customer opportunity click - show quest modal OR morale event
  // IMPORTANT: Morale events ONLY trigger when customer has "moral_dilemma" opportunity
  const handleCustomerClick = useCallback((customerId: string) => {
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (!customer || activeCustomerQuest || activeChoice) return;

    // ONLY trigger morale event if customer has moral_dilemma opportunity
    if (customer.opportunity === "moral_dilemma") {
      // Trigger a morale event - this customer has a moral dilemma to discuss
      const randomEvent = moralEvents[Math.floor(Math.random() * moralEvents.length)];
      setActiveChoice(randomEvent);
      setCustomerForMoralEvent(customer); // Track which customer triggered this
      
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
  }, [customers, activeCustomerQuest, activeChoice, stats, pushLog, showSkeletonComment]);

  // Handle bar toggle
  const handleToggleBar = useCallback(() => {
    const willBeOpen = !barOpen;
    setBarOpen(willBeOpen);
    
    if (willBeOpen) {
      pushLog(`Bar is now OPEN. Customers welcome!`);
      // Immediately spawn a customer when opening
      setTimeout(() => spawnCustomer(true), 500);
    } else {
      pushLog(`Bar is now CLOSED. No new customers.`);
    }
  }, [barOpen, pushLog, spawnCustomer]);

  // Handle customer quest choice
  const handleCustomerQuestChoice = useCallback((choiceIndex: number) => {
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
  }, [activeCustomerQuest, customers, moral, pushLog, showSkeletonComment, adjustMoral]);

  // Prestige system - reset for permanent bonuses
  const handlePrestige = useCallback(() => {
    if (totalEarned < 10000) {
      pushLog("You need at least €10,000 total earned for Prestige!");
      return;
    }
    
    const newPrestigePoints = Math.floor(totalEarned / 10000);
    setPrestigePoints((pp: number) => pp + newPrestigePoints);
    setPrestigeLevel((pl: number) => pl + 1);
    
    // Reset everything
    setBeer(0);
    setMoney(0);
    setTotalGlassesSold(0);
    setUpgrades(initialUpgrades);
    setMoral(70);
    setTotalEarned(0);
    
    pushLog(`🌟 PRESTIGE! You earned ${newPrestigePoints} prestige points!`);
    pushLog(`You start over, but with ${newPrestigePoints * 10}% permanent bonus!`);
  }, [totalEarned, pushLog]);

  const triggerPunishment = useCallback((severity: "moderate" | "severe") => {
    const punishmentTemplates = {
      moderate: [
        {
          title: "Corporate Restructuring",
          message: "Your HR department has 'decided' to 'optimize' your staff. They're all fired. Efficiency!",
          moneyPercent: 0.25,
          beerPercent: 0.3,
          moral: -5
        },
        {
          title: "Customer Lawsuit",
          message: "A customer has sued you for 'poisoning' or something. Your lawyers cost a fortune. But hey, you have a nice new lawsuit!",
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
          title: "Beer Recall",
          message: "Your beer is being recalled because it's 'possibly dangerous'. Corporate says: 'It's for your own safety!' You lose everything.",
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
          message: "The government has closed your bar for 'safety reasons'. You have to pay for 'reforms' and 'certifications'. Corporate culture in action!",
          moneyPercent: 0.7,
          moral: -12
        },
        {
          title: "Beer Poisoned - Mass Recall",
          message: "Your beer made people sick. Or dead. Who knows. Corporate says: 'We take this seriously!' You lose everything and get a lifetime fine.",
          beerPercent: 0.8,
          moneyPercent: 0.6,
          moral: -20
        },
        {
          title: "Corporate Merger - You Are Unimportant",
          message: "Your bar has been 'merged' with a larger company. You are now a number. You lose your identity, your profit, and your soul. Welcome to corporate!",
          moneyPercent: 0.65,
          beerPercent: 0.5,
          moral: -18
        },
        {
          title: "Theft by 'Internal Restructuring'",
          message: "Your money has been 'redistributed' by corporate. They call it 'optimization'. You call it theft. They always win.",
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
    
    // Calculate punishments with functional updates
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
    pushLog(`[PUNISHMENT] ${punishment.title}: ${punishment.message}`);
    if (moneyLost > 0) {
      pushLog(`→ Money lost: €${moneyLost}`);
    }
    if (beerLost > 0) {
      pushLog(`→ Beer lost: ${beerLost.toFixed(0)} cl`);
    }
  }, [moral, pushLog, showSkeletonComment, adjustMoral]);

  const handleMoralChoice = useCallback((choiceIndex: number) => {
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
  }, [activeChoice, customerForMoralEvent, moral, pushLog, showSkeletonComment, adjustMoral]);

  const handleManualTap = useCallback(() => {
    const amount = stats.tapPerTick * 0.8;
    setBeer((b: number) => b + amount);
    // No skeleton comment and no log entry for manual tapping
    // so the chat/log doesn't fill up with tap messages.
  }, [stats.tapPerTick]);

  const handleSellOneBatch = useCallback(() => {
    setBeer((prevBeer: number) => {
      const drinkCapacity = stats.drinkCapacity;
      const availableGlasses = Math.floor(prevBeer / drinkCapacity);
      if (availableGlasses <= 0) {
        // Only 30% chance for skeleton comment on empty glasses
        if (Math.random() > 0.7) {
          const dialog = getRandomDialog("empty_sell", moral);
          showSkeletonComment(dialog);
        }
        pushLog("You try to sell, but your glasses are empty.");
        // No morale penalty anymore - only bad choices in events give penalty
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
      // Only 30% chance for skeleton comment on sale
      if (Math.random() > 0.7) {
        const dialog = getRandomDialog("sell", moral);
        showSkeletonComment(dialog);
      }
      const drinkName = stats.currentDrink.name.toLowerCase();
      pushLog(`You sold ${toSell} ${drinkName} for €${earned.toFixed(0)}.`);
      // No morale from normal sale - only good choices give morale
      return prevBeer - toSell * drinkCapacity;
    });
  }, [stats.drinkCapacity, stats.pricePerGlass, goldenEventActive, moral, pushLog, showSkeletonComment]);

  const handleBuyUpgrade = useCallback((upgradeId: UpgradeId) => {
    setUpgrades((prev: Upgrade[]) => {
      const upgrade = prev.find((u: Upgrade) => u.id === upgradeId);
      if (!upgrade) return prev;
      if (upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel) {
        return prev;
      }
      // Fix: Calculate cost BEFORE the check, and use functional update for money
      const cost = calculateUpgradeCost(upgrade);
      if (money < cost) {
        // Only 30% chance for skeleton comment on failed upgrade
        if (Math.random() > 0.7) {
          const dialog = getRandomDialog("no_money", moral);
          showSkeletonComment(dialog);
        }
        pushLog(`Not enough money for ${upgrade.name}.`);
        // No morale penalty on no money - only bad choices give penalty
        return prev;
      }
      // Fix: Use functional update to prevent race conditions
      setMoney((m: number) => {
        const newMoney = m - cost;
        if (newMoney < 0) {
          pushLog(`Error: not enough money for ${upgrade.name}.`);
          return m; // Don't deduct money if there's not enough
        }
        return newMoney;
      });
      
      // Unlock drinks based on upgrades
      if (upgradeId === "wine_cellar" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "wijn" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍷 Wine cellar unlocked! You can now serve wine.");
      } else if (upgradeId === "cocktail_bar" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "cocktail" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍸 Cocktail bar unlocked! Time to mix!");
      } else if (upgradeId === "whiskey_collection" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "whiskey" ? { ...d, unlocked: true } : d)
        );
        pushLog("🥃 Whiskey collection unlocked! For the connoisseurs.");
      } else if (upgradeId === "champagne_service" && upgrade.level === 0) {
        setDrinks((prev: Drink[]) => 
          prev.map((d: Drink) => d.type === "champagne" ? { ...d, unlocked: true } : d)
        );
        pushLog("🍾 Champagne service unlocked! Cheers!");
      }
      
      // Only 30% chance for skeleton comment on successful upgrade
      if (Math.random() > 0.7) {
        const dialog = getRandomDialog("upgrade", moral);
        showSkeletonComment(dialog);
      }
      pushLog(`Upgrade purchased: ${upgrade.name} (level ${upgrade.level + 1}) for €${cost}.`);
      // No morale from upgrades - only good choices give morale
      return prev.map((u: Upgrade) =>
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      );
    });
  }, [money, moral, pushLog, showSkeletonComment]);

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




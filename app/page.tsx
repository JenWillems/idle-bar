"use client";

import React, { useCallback, useEffect, useState } from "react";
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

// Import extracted constants
import { initialDrinks } from "./constants/drinks";
import { initialUpgrades } from "./constants/upgrades";
import { moralEvents } from "./constants/moralEvents";
import { skeletonPersonalities, upgradeToCustomerMap } from "./constants/skeletonPersonalities";
import { getRandomDialog } from "./constants/dialogs";

// Import utilities
import { calculateUpgradeCost } from "./utils/gameLogic";
import { generateCustomerQuest } from "./utils/customerUtils";
import { triggerPunishment } from "./utils/punishmentHandler";

// Import hooks
import { useGameStats } from "./hooks/useGameStats";
import { useAchievements } from "./hooks/useAchievements";
import { useCustomerSpawning } from "./hooks/useCustomerSpawning";


export default function HomePage() {
  const [beer, setBeer] = useState(0); // ruwe bier-eenheden
  const [money, setMoney] = useState(0);
  const [totalGlassesSold, setTotalGlassesSold] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [activeDrink, setActiveDrink] = useState<DrinkType>("bier");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
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

  // Use extracted hook for game stats
  const stats = useGameStats(upgrades, moral, prestigePoints, drinks, activeDrink);

  // Helper functions
  const pushLog = useCallback((message: string) => {
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    setLog((prev: LogEntry[]) => {
      const next: LogEntry[] = [{ id: newId, message }, ...prev];
      return next.slice(0, 15);
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

  // Use achievements hook
  useAchievements({
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
  });

  // Offline progress berekenen bij mount
  useEffect(() => {
    const savedTime = localStorage.getItem('lastSaveTime');
    if (savedTime) {
      const offlineTime = Date.now() - parseInt(savedTime);
      const offlineMinutes = Math.floor(offlineTime / 60000);
      if (offlineMinutes > 1) {
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
  }, [stats.tapPerTick, stats.tapInterval, pushLog]);

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
    const autoSellerLevel = upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
    if (autoSellerLevel <= 0) return;

    const id = window.setInterval(() => {
      setBeer((prevBeer: number) => {
        const drinkCapacity = stats.drinkCapacity;
        const availableGlasses = Math.floor(prevBeer / drinkCapacity);
        const toSell = Math.min(availableGlasses, Math.max(1, Math.floor(stats.autoSellBatch)));
        if (toSell <= 0) return prevBeer;

        const earned = toSell * stats.pricePerGlass * (goldenEventActive ? 2 : 1);
        setMoney((m: number) => {
          const newMoney = m + earned;
          setTotalEarned((te: number) => te + earned);
          return newMoney;
        });
        setTotalGlassesSold((g: number) => g + toSell);
        if (Math.random() > 0.8) {
          const dialog = getRandomDialog("auto_sell", moral);
          showSkeletonComment(dialog);
        }
        pushLog(`Your staff sold ${toSell} ${stats.currentDrink.name.toLowerCase()} for €${earned.toFixed(0)}.`);
        return prevBeer - toSell * drinkCapacity;
      });
    }, stats.autoSellInterval);

    return () => window.clearInterval(id);
  }, [stats.autoSellInterval, stats.autoSellBatch, stats.pricePerGlass, stats.drinkCapacity, stats.currentDrink.name, upgrades, goldenEventActive, moral, showSkeletonComment, pushLog]);

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
      
      if (moralEffective < 20) {
        const minInterval = 15000;
        const maxInterval = 25000;
        if (timeSinceLastPunishment >= minInterval + Math.random() * (maxInterval - minInterval)) {
          triggerPunishment("severe", {
            setMoney,
            setBeer,
            adjustMoral,
            showSkeletonComment,
            pushLog,
            moral
          });
          setLastPunishmentTime(now);
        }
      } else if (moralEffective < 40) {
        const minInterval = 30000;
        const maxInterval = 45000;
        if (timeSinceLastPunishment >= minInterval + Math.random() * (maxInterval - minInterval)) {
          triggerPunishment("moderate", {
            setMoney,
            setBeer,
            adjustMoral,
            showSkeletonComment,
            pushLog,
            moral
          });
          setLastPunishmentTime(now);
        }
      }
    };

    const id = window.setInterval(checkForPunishment, 5000);
    return () => window.clearInterval(id);
  }, [lastPunishmentTime, stats.moralEffective, adjustMoral, showSkeletonComment, pushLog, moral]);

  // Golden Events (zoals Cookie Clicker) - willekeurige bonussen
  useEffect(() => {
    const checkGoldenEvent = () => {
      if (Math.random() < 0.01 && !goldenEventActive) {
        setGoldenEventActive(true);
        pushLog("✨ GOLDEN EVENT! 3x beer production and 2x sell price for 30 seconds!");
        showSkeletonComment("LUCKY! You found a golden opportunity! Or did it find you?");
        
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
  }, [goldenEventActive, pushLog, showSkeletonComment]);

  // Track max upgrade level for achievements
  useEffect(() => {
    const maxLevel = Math.max(...upgrades.map(u => u.level), 0);
    if (maxLevel > maxUpgradeLevel) {
      setMaxUpgradeLevel(maxLevel);
    }
  }, [upgrades, maxUpgradeLevel]);


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
  }, [upgrades, pushLog]);

  // Use customer spawning hook
  const spawnCustomer = useCustomerSpawning({
    barOpen,
    upgrades,
    unlockedCustomers,
    servedCustomers,
    stats,
    customers,
    setCustomers,
    setServedCustomers,
    pushLog
  });


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

  // Automatische customer service removed - no longer needed

  // Automatische upgrades kopen (idle gameplay)
  useEffect(() => {
    const autoUpgradeLevel = upgrades.find((u: Upgrade) => u.id === "auto_upgrade")?.level ?? 0;
    if (autoUpgradeLevel <= 0) return;

    const buyAutoUpgrades = () => {
      setUpgrades((prev: Upgrade[]) => {
        return prev.map((upgrade: Upgrade) => {
          const cost = calculateUpgradeCost(upgrade, prev);
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
  }, [upgrades, money, pushLog]);

  // Automatische drank selectie (idle gameplay)
  useEffect(() => {
    const smartInventoryLevel = upgrades.find((u: Upgrade) => u.id === "smart_inventory")?.level ?? 0;
    if (smartInventoryLevel <= 0) return;

    const selectBestDrink = () => {
      const unlockedDrinks = drinks.filter((d: Drink) => d.unlocked);
      if (unlockedDrinks.length <= 1) return;

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
  }, [drinks, activeDrink, upgrades, pushLog]);

  // Passive income removed - no longer needed


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
      const quest = generateCustomerQuest(customer, stats.currentDrink.name, stats.drinkCapacity, customer.orderValue, { currentDrink: stats.currentDrink });
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
      
      // Drink unlocking removed - focus on money-making upgrades only
      
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




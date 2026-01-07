import { useMemo } from "react";
import type { Upgrade, Drink, DrinkType } from "../types";
import { BASE_TAP_INTERVAL, BASE_TAP_AMOUNT, BASE_SELL_INTERVAL, BASE_SELL_BATCH } from "../constants/gameConstants";

export interface GameStats {
  tapInterval: number;
  tapPerTick: number;
  pricePerGlass: number;
  autoSellInterval: number;
  autoSellBatch: number;
  moralEffective: number;
  prestigeMultiplier: number;
  currentDrink: Drink;
  drinkCapacity: number;
}

export function useGameStats(
  upgrades: Upgrade[],
  moral: number,
  prestigePoints: number,
  drinks: Drink[],
  activeDrink: DrinkType
): GameStats {
  return useMemo(() => {
    const currentDrink = drinks.find((d: Drink) => d.type === activeDrink) || drinks[0];
    if (!currentDrink) {
      console.error("No drink found! drinks:", drinks, "activeDrink:", activeDrink);
      // Return safe defaults
      return {
        tapInterval: 1000,
        tapPerTick: 1,
        pricePerGlass: 4,
        autoSellInterval: 4000,
        autoSellBatch: 4,
        moralEffective: 70,
        prestigeMultiplier: 1,
        currentDrink: drinks[0] || { type: "bier" as DrinkType, name: "Bier", basePrice: 4, productionTime: 1000, capacity: 20, unlocked: true, level: 0 },
        drinkCapacity: 20
      };
    }
    const tapSpeedLevel = upgrades.find((u: Upgrade) => u.id === "tap_speed")?.level ?? 0;
    const tapAmountLevel = upgrades.find((u: Upgrade) => u.id === "tap_amount")?.level ?? 0;
    const sellPriceLevel = upgrades.find((u: Upgrade) => u.id === "sell_price")?.level ?? 0;
    const autoSellerLevel = upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
    const staffLevel = upgrades.find((u: Upgrade) => u.id === "staff_training")?.level ?? 0;
    const wateredDownLevel = upgrades.find((u: Upgrade) => u.id === "watered_down")?.level ?? 0;
    const hiddenFeesLevel = upgrades.find((u: Upgrade) => u.id === "hidden_fees")?.level ?? 0;
    const tipStealingLevel = upgrades.find((u: Upgrade) => u.id === "tip_stealing")?.level ?? 0;
    const qualityIngredientsLevel = upgrades.find((u: Upgrade) => u.id === "quality_ingredients")?.level ?? 0;
    const fairWagesLevel = upgrades.find((u: Upgrade) => u.id === "fair_wages")?.level ?? 0;
    const sustainablePracticesLevel = upgrades.find((u: Upgrade) => u.id === "sustainable_practices")?.level ?? 0;

    const tapSpeedReduction = tapSpeedLevel * 0.05;
    const drinkProductionTime = currentDrink.productionTime * (1 - tapSpeedReduction);
    const tapInterval = Math.max(300, drinkProductionTime);
    const drinkCapacity = currentDrink.capacity;
    const tapPerTick = BASE_TAP_AMOUNT * (1 + tapAmountLevel * 0.25) * (drinkCapacity / 20);

    const basePricePerGlass = currentDrink.basePrice;
    const drinkLevel = currentDrink.level;
    const priceBonus =
      sellPriceLevel * 0.3 + 
      staffLevel * 0.05 +
      hiddenFeesLevel * 0.15 +
      tipStealingLevel * 0.1 +
      wateredDownLevel * 0.25 +
      qualityIngredientsLevel * 0.2 +
      fairWagesLevel * 0.15 +
      sustainablePracticesLevel * 0.12 +
      drinkLevel * 0.1;
    const pricePerGlassWithBonus = basePricePerGlass * (1 + priceBonus);

    const autoSellInterval =
      BASE_SELL_INTERVAL * Math.max(0.3, 1 - autoSellerLevel * 0.12 - fairWagesLevel * 0.05 - sustainablePracticesLevel * 0.03);
    const autoSellBatch =
      BASE_SELL_BATCH * (1 + autoSellerLevel * 0.25 + staffLevel * 0.1 + fairWagesLevel * 0.15);

    const moralEffective = Math.min(
      130,
      Math.max(0, moral + staffLevel * 4 + qualityIngredientsLevel * 2 + fairWagesLevel * 3 + sustainablePracticesLevel * 2 - autoSellerLevel * 2 - wateredDownLevel * 1 - hiddenFeesLevel * 1 - tipStealingLevel * 2)
    );
    
    const improvedAutoSellInterval = autoSellInterval * (1 - sustainablePracticesLevel * 0.03);
    const improvedAutoSellBatch = autoSellBatch;

    let moralMultiplier = 1.0;
    let priceMultiplier = 1.0;
    let efficiencyMultiplier = 1.0;
    
    if (moralEffective >= 90) {
      moralMultiplier = 1.5;
      priceMultiplier = 1.4;
      efficiencyMultiplier = 1.3;
    } else if (moralEffective >= 70) {
      moralMultiplier = 1.25;
      priceMultiplier = 1.2;
      efficiencyMultiplier = 1.15;
    } else if (moralEffective >= 50) {
      moralMultiplier = 1.0;
      priceMultiplier = 1.0;
      efficiencyMultiplier = 1.0;
    } else if (moralEffective >= 30) {
      moralMultiplier = 0.8;
      priceMultiplier = 0.75;
      efficiencyMultiplier = 0.85;
    } else {
      moralMultiplier = 0.6;
      priceMultiplier = 0.5;
      efficiencyMultiplier = 0.7;
    }

    const prestigeMultiplier = Math.max(0.1, 1 + (prestigePoints * 0.1));
    const safeEfficiencyMultiplier = Math.max(0.1, efficiencyMultiplier);

    const finalTapInterval = Math.max(100, Math.min(10000, (tapInterval / safeEfficiencyMultiplier) / prestigeMultiplier));
    const finalTapPerTick = Math.max(0.1, Math.min(1000, tapPerTick * moralMultiplier * prestigeMultiplier));
    const finalPricePerGlass = Math.max(0.1, Math.min(10000, pricePerGlassWithBonus * priceMultiplier * prestigeMultiplier));
    const finalAutoSellInterval = Math.max(100, Math.min(10000, (improvedAutoSellInterval / safeEfficiencyMultiplier) / prestigeMultiplier));
    const finalAutoSellBatch = Math.max(1, Math.min(100, improvedAutoSellBatch * safeEfficiencyMultiplier * prestigeMultiplier));

    // Ensure all values are valid numbers (not NaN or Infinity)
    const safeTapInterval = isFinite(finalTapInterval) && !isNaN(finalTapInterval) ? finalTapInterval : 1000;
    const safeTapPerTick = isFinite(finalTapPerTick) && !isNaN(finalTapPerTick) ? finalTapPerTick : 1;
    const safePricePerGlass = isFinite(finalPricePerGlass) && !isNaN(finalPricePerGlass) ? finalPricePerGlass : 4;
    const safeAutoSellInterval = isFinite(finalAutoSellInterval) && !isNaN(finalAutoSellInterval) ? finalAutoSellInterval : 4000;
    const safeAutoSellBatch = isFinite(finalAutoSellBatch) && !isNaN(finalAutoSellBatch) ? finalAutoSellBatch : 4;
    const safeMoralEffective = isFinite(moralEffective) && !isNaN(moralEffective) ? Math.max(0, Math.min(130, moralEffective)) : 70;

    return {
      tapInterval: safeTapInterval,
      tapPerTick: safeTapPerTick,
      pricePerGlass: safePricePerGlass,
      autoSellInterval: safeAutoSellInterval,
      autoSellBatch: safeAutoSellBatch,
      moralEffective: safeMoralEffective,
      prestigeMultiplier,
      currentDrink,
      drinkCapacity: currentDrink.capacity
    };
  }, [upgrades, moral, prestigePoints, drinks, activeDrink]);
}

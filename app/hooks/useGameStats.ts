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
    const tapSpeedLevel = upgrades.find((u: Upgrade) => u.id === "tap_speed")?.level ?? 0;
    const tapAmountLevel = upgrades.find((u: Upgrade) => u.id === "tap_amount")?.level ?? 0;
    const sellPriceLevel = upgrades.find((u: Upgrade) => u.id === "sell_price")?.level ?? 0;
    const autoSellerLevel = upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
    const premiumLevel = upgrades.find((u: Upgrade) => u.id === "premium_bier")?.level ?? 0;
    const staffLevel = upgrades.find((u: Upgrade) => u.id === "staff_training")?.level ?? 0;
    const expansionLevel = upgrades.find((u: Upgrade) => u.id === "bar_expansion")?.level ?? 0;
    const vipLevel = upgrades.find((u: Upgrade) => u.id === "vip_section")?.level ?? 0;
    const lateNightLevel = upgrades.find((u: Upgrade) => u.id === "late_night_hours")?.level ?? 0;
    const wateredDownLevel = upgrades.find((u: Upgrade) => u.id === "watered_down")?.level ?? 0;
    const hiddenFeesLevel = upgrades.find((u: Upgrade) => u.id === "hidden_fees")?.level ?? 0;
    const tipStealingLevel = upgrades.find((u: Upgrade) => u.id === "tip_stealing")?.level ?? 0;
    const qualityIngredientsLevel = upgrades.find((u: Upgrade) => u.id === "quality_ingredients")?.level ?? 0;
    const fairWagesLevel = upgrades.find((u: Upgrade) => u.id === "fair_wages")?.level ?? 0;
    const customerLoyaltyLevel = upgrades.find((u: Upgrade) => u.id === "customer_loyalty")?.level ?? 0;
    const premiumServiceLevel = upgrades.find((u: Upgrade) => u.id === "premium_service")?.level ?? 0;
    const sustainablePracticesLevel = upgrades.find((u: Upgrade) => u.id === "sustainable_practices")?.level ?? 0;
    const communitySupportLevel = upgrades.find((u: Upgrade) => u.id === "community_support")?.level ?? 0;

    const drinkProductionTime = currentDrink.productionTime * (1 - tapSpeedLevel * 0.05);
    const tapInterval = Math.max(300, drinkProductionTime * (1 - tapSpeedLevel * 0.05));
    const drinkCapacity = currentDrink.capacity;
    const tapPerTick = BASE_TAP_AMOUNT * (1 + tapAmountLevel * 0.25) * (drinkCapacity / 20);

    const basePricePerGlass = currentDrink.basePrice;
    const drinkLevel = currentDrink.level;
    const priceBonus =
      sellPriceLevel * 0.3 + 
      premiumLevel * 0.4 + 
      staffLevel * 0.05 +
      vipLevel * 0.3 +
      lateNightLevel * 0.2 +
      hiddenFeesLevel * 0.15 +
      tipStealingLevel * 0.1 +
      wateredDownLevel * 0.25 +
      qualityIngredientsLevel * 0.2 +
      fairWagesLevel * 0.15 +
      customerLoyaltyLevel * 0.25 +
      premiumServiceLevel * 0.3 +
      sustainablePracticesLevel * 0.12 +
      communitySupportLevel * 0.18 +
      drinkLevel * 0.1;
    const finalPricePerGlass = basePricePerGlass * (1 + priceBonus);

    const autoSellInterval =
      BASE_SELL_INTERVAL * Math.max(0.3, 1 - autoSellerLevel * 0.12 - fairWagesLevel * 0.05 - sustainablePracticesLevel * 0.03);
    const autoSellBatch =
      BASE_SELL_BATCH * (1 + autoSellerLevel * 0.25 + staffLevel * 0.1 + fairWagesLevel * 0.15 + premiumServiceLevel * 0.1);

    const moralEffective = Math.min(
      130,
      Math.max(0, moral + staffLevel * 4 + qualityIngredientsLevel * 2 + fairWagesLevel * 3 + customerLoyaltyLevel * 2 + communitySupportLevel * 3 + sustainablePracticesLevel * 2 + premiumServiceLevel * 2 - autoSellerLevel * 2 - wateredDownLevel * 1 - hiddenFeesLevel * 1 - tipStealingLevel * 2)
    );
    
    const improvedAutoSellInterval = autoSellInterval * (1 - lateNightLevel * 0.05 - sustainablePracticesLevel * 0.03);
    const improvedAutoSellBatch = autoSellBatch * (1 + expansionLevel * 0.15 + customerLoyaltyLevel * 0.1 + premiumServiceLevel * 0.08);

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

    const prestigeMultiplier = 1 + (prestigePoints * 0.1);

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
}

import type { Upgrade } from "../types";

export function calculateUpgradeCost(upgrade: Upgrade, upgrades?: Upgrade[]): number {
  const baseCost = Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
  );
  
  if (upgrades) {
    const sustainableLevel = upgrades.find((u: Upgrade) => u.id === "sustainable_practices")?.level ?? 0;
    const costReduction = sustainableLevel * 0.05;
    return Math.floor(baseCost * (1 - costReduction));
  }
  
  return baseCost;
}

export interface CostBreakdown {
  barStock: number;
  employeeCost: number;
  taxes: number;
  total: number;
}

export function calculateOperatingCosts(
  money: number,
  upgrades: Upgrade[],
  tapPerTick: number,
  tapInterval: number
): CostBreakdown {
  // Base bar stock cost - scales with production rate
  const productionRate = (tapPerTick * 1000) / tapInterval; // cl per second
  const baseBarStockCost = 5 + (productionRate * 0.5); // Base cost + production scaling
  
  // Employee cost - only if you have employees (auto_seller upgrade)
  const autoSellerLevel = upgrades.find((u: Upgrade) => u.id === "auto_seller")?.level ?? 0;
  const baseEmployeeCost = autoSellerLevel > 0 ? 10 + (autoSellerLevel * 5) : 0;
  
  // Taxes - percentage of money owned
  const baseTaxRate = 0.02; // 2% of money
  const baseTaxes = money * baseTaxRate;
  
  // Calculate upgrade modifiers
  // Good upgrades reduce costs
  const sustainableLevel = upgrades.find((u: Upgrade) => u.id === "sustainable_practices")?.level ?? 0;
  const fairWagesLevel = upgrades.find((u: Upgrade) => u.id === "fair_wages")?.level ?? 0;
  const qualityIngredientsLevel = upgrades.find((u: Upgrade) => u.id === "quality_ingredients")?.level ?? 0;
  
  // Evil upgrades can reduce costs through unethical means, but some increase costs
  const wateredDownLevel = upgrades.find((u: Upgrade) => u.id === "watered_down")?.level ?? 0;
  const tipStealingLevel = upgrades.find((u: Upgrade) => u.id === "tip_stealing")?.level ?? 0;
  const hiddenFeesLevel = upgrades.find((u: Upgrade) => u.id === "hidden_fees")?.level ?? 0;
  
  // Good upgrades reduce costs
  const goodCostReduction = 
    sustainableLevel * 0.08 +      // Sustainable practices reduce stock costs
    fairWagesLevel * 0.05 +         // Fair wages reduce employee costs (but increase base cost)
    qualityIngredientsLevel * 0.03; // Quality ingredients reduce waste
  
  // Evil upgrades reduce costs through unethical means
  const evilCostReduction = 
    wateredDownLevel * 0.10 +       // Watering down reduces stock costs
    tipStealingLevel * 0.08 +      // Stealing tips reduces employee costs
    hiddenFeesLevel * 0.05;         // Hidden fees help with cash flow
  
  // Apply modifiers (cap reductions to prevent negative costs)
  const barStockModifier = Math.max(0.3, 1 - goodCostReduction - (evilCostReduction * 0.5));
  const employeeModifier = Math.max(0.4, 1 - (fairWagesLevel * 0.03) - (evilCostReduction * 0.3));
  // Fair wages increase base employee cost but reduce total through efficiency
  const adjustedEmployeeCost = baseEmployeeCost * (1 + fairWagesLevel * 0.2) * employeeModifier;
  
  // Tax evasion through evil upgrades (cap at 50% reduction)
  const taxEvasion = Math.min(0.5, tipStealingLevel * 0.15 + hiddenFeesLevel * 0.10);
  const taxModifier = Math.max(0.5, 1 - taxEvasion);
  
  const barStock = Math.max(1, baseBarStockCost * barStockModifier);
  const employeeCost = Math.max(0, adjustedEmployeeCost);
  const taxes = Math.max(0, baseTaxes * taxModifier);
  
  return {
    barStock: Math.floor(barStock),
    employeeCost: Math.floor(employeeCost),
    taxes: Math.floor(taxes),
    total: Math.floor(barStock + employeeCost + taxes)
  };
}
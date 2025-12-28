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

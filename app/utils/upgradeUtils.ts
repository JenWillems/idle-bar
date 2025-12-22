import type { Upgrade } from "../types";

export function calculateUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
  );
}

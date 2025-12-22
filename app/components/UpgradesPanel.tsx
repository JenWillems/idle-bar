"use client";

import React from "react";
import type { Upgrade, UpgradeId } from "../types";

interface UpgradesPanelProps {
  upgrades: Upgrade[];
  money: number;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  calculateUpgradeCost: (upgrade: Upgrade) => number;
}

export default function UpgradesPanel({
  upgrades,
  money,
  onBuyUpgrade,
  calculateUpgradeCost
}: UpgradesPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Upgrades</div>
          <div className="card-subtitle">
            Similar structure to your previous game: costs scale per level and affect multiple stats.
          </div>
        </div>
      </div>

      <div className="upgrades-list">
        {upgrades.map((upgrade) => {
          const cost = calculateUpgradeCost(upgrade);
          const canAfford = money >= cost;
          return (
            <div key={upgrade.id} className="upgrade-row">
              <div className="upgrade-main">
                <div className="upgrade-name">{upgrade.name}</div>
                <div className="upgrade-meta">
                  <span className="upgrade-chip">
                    <strong>{upgrade.category}</strong>
                  </span>
                  <span>{upgrade.description}</span>
                </div>
                <div className="upgrade-level">
                  Level: <strong>{upgrade.level}</strong>
                </div>
              </div>
              <div className="upgrade-actions">
                <div className="upgrade-price">€{cost}</div>
                <button
                  className="btn-small btn-small-primary"
                  onClick={() => onBuyUpgrade(upgrade.id)}
                  disabled={!canAfford}
                >
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

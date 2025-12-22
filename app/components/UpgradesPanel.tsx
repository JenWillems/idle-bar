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
    <div className="upgrades-panel-redesign">
      <div className="upgrades-grid">
        {upgrades.map((upgrade) => {
          const cost = calculateUpgradeCost(upgrade);
          const canAfford = money >= cost;
          return (
            <div 
              key={upgrade.id} 
              className={`upgrade-card ${canAfford ? 'affordable' : 'locked'}`}
            >
              <div className="upgrade-card-header">
                <div className="upgrade-card-title">{upgrade.name}</div>
                <div className="upgrade-card-category">{upgrade.category}</div>
              </div>
              
              <div className="upgrade-card-body">
                <div className="upgrade-card-description">{upgrade.description}</div>
                <div className="upgrade-card-level">
                  <span>Level</span>
                  <span className="level-value">{upgrade.level}</span>
                </div>
              </div>

              <div className="upgrade-card-footer">
                <div className="upgrade-card-price">
                  <span className="price-label">Cost</span>
                  <span className="price-value">€{cost.toLocaleString()}</span>
                </div>
                <button
                  className="upgrade-buy-btn"
                  onClick={() => onBuyUpgrade(upgrade.id)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Buy' : 'Locked'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


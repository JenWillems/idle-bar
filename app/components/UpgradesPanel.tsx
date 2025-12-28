"use client";

import React, { useState } from "react";
import type { Upgrade, UpgradeId } from "../types";

interface UpgradesPanelProps {
  upgrades: Upgrade[];
  money: number;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  calculateUpgradeCost: (upgrade: Upgrade, upgrades?: Upgrade[]) => number;
}

type UpgradeTab = "GOOD" | "EVIL" | "BUSINESS";

export default function UpgradesPanel({
  upgrades,
  money,
  onBuyUpgrade,
  calculateUpgradeCost
}: UpgradesPanelProps) {
  const [activeTab, setActiveTab] = useState<UpgradeTab>("GOOD");

  // Group upgrades by category
  const goodUpgrades = upgrades.filter(u => u.category === "GOOD");
  const evilUpgrades = upgrades.filter(u => u.category === "EVIL");
  const businessUpgrades = upgrades.filter(u => u.category === "BUSINESS");

  const renderUpgradeCard = (upgrade: Upgrade) => {
    const cost = calculateUpgradeCost(upgrade, upgrades);
    const canAfford = money >= cost;
    return (
      <div 
        key={upgrade.id} 
        className={`upgrade-card ${upgrade.category.toLowerCase()} ${canAfford ? 'affordable' : 'locked'}`}
      >
        <div className="upgrade-card-header">
          <div className="upgrade-card-title">{upgrade.name}</div>
          <div className={`upgrade-card-category ${upgrade.category.toLowerCase()}`}>
            {upgrade.category}
          </div>
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
  };

  const getCurrentUpgrades = () => {
    switch (activeTab) {
      case "GOOD":
        return goodUpgrades;
      case "EVIL":
        return evilUpgrades;
      case "BUSINESS":
        return businessUpgrades;
      default:
        return goodUpgrades;
    }
  };

  const currentUpgrades = getCurrentUpgrades();

  return (
    <div className="upgrades-panel-redesign">
      {/* Tab Navigation */}
      <div className="upgrade-tabs">
        <button
          className={`upgrade-tab ${activeTab === "GOOD" ? "active" : ""}`}
          onClick={() => setActiveTab("GOOD")}
        >
          ✨ Good
        </button>
        <button
          className={`upgrade-tab ${activeTab === "EVIL" ? "active" : ""}`}
          onClick={() => setActiveTab("EVIL")}
        >
          😈 Evil
        </button>
        <button
          className={`upgrade-tab ${activeTab === "BUSINESS" ? "active" : ""}`}
          onClick={() => setActiveTab("BUSINESS")}
        >
          💼 Business
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="upgrade-category-section" key={activeTab}>
        {currentUpgrades.length > 0 ? (
          <div className="upgrades-grid">
            {currentUpgrades.map(renderUpgradeCard)}
          </div>
        ) : (
          <div className="no-upgrades-message">
            No {activeTab.toLowerCase()} upgrades available.
          </div>
        )}
      </div>
    </div>
  );
}

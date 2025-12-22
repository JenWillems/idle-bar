"use client";

import React from "react";

interface AchievementsPanelProps {
  achievements: Set<string>;
  prestigeLevel: number;
  prestigePoints: number;
  totalEarned: number;
  goldenEventActive: boolean;
  onPrestige: () => void;
}

export default function AchievementsPanel({
  achievements,
  prestigeLevel,
  prestigePoints,
  totalEarned,
  goldenEventActive,
  onPrestige
}: AchievementsPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Prestige & Achievements</div>
          <div className="card-subtitle">
            Reset your progress for permanent bonuses. Cookie Clicker style!
          </div>
        </div>
      </div>

      <div className="prestige-section">
        <div className="prestige-info">
          <div className="metric">
            <span className="metric-label">Prestige Level</span>
            <span className="metric-value">{prestigeLevel}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Prestige Points</span>
            <span className="metric-value">{prestigePoints}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Earned</span>
            <span className="metric-value">€{totalEarned.toFixed(0)}</span>
          </div>
        </div>
        
        <div className="prestige-bonus">
          <div className="section-label">Prestige Bonus</div>
          <div className="metric-value">+{prestigePoints * 10}% on everything</div>
        </div>

        <button 
          className={`tap-button ${totalEarned >= 10000 ? "" : "disabled"}`}
          onClick={onPrestige}
          disabled={totalEarned < 10000}
        >
          Prestige ({Math.floor(totalEarned / 10000)} points)
        </button>

        {goldenEventActive && (
          <div className="golden-event-indicator">
            ✨ GOLDEN EVENT ACTIVE! 3x beer, 2x price!
          </div>
        )}

        <div className="achievements-section">
          <div className="section-label">Achievements ({achievements.size})</div>
          <div className="achievements-list">
            {/* Sales Achievements */}
            {achievements.has("first_100") && <span className="achievement-badge">🏆 100 Glasses</span>}
            {achievements.has("thousand_sold") && <span className="achievement-badge">🏆 1K Glasses</span>}
            {achievements.has("ten_thousand_sold") && <span className="achievement-badge">🏆 10K Glasses</span>}
            {achievements.has("hundred_thousand_sold") && <span className="achievement-badge">🏆 100K Glasses</span>}
            
            {/* Money Achievements */}
            {achievements.has("thousandaire") && <span className="achievement-badge">💰 €1K</span>}
            {achievements.has("ten_thousandaire") && <span className="achievement-badge">💰 €10K</span>}
            {achievements.has("hundred_thousandaire") && <span className="achievement-badge">💰 €100K</span>}
            {achievements.has("millionaire") && <span className="achievement-badge">💰 €1M</span>}
            
            {/* Moral Achievements */}
            {achievements.has("saint") && <span className="achievement-badge">😇 Saint</span>}
            {achievements.has("angel") && <span className="achievement-badge">😇 Angel</span>}
            {achievements.has("villain") && <span className="achievement-badge">😈 Villain</span>}
            {achievements.has("demon") && <span className="achievement-badge">😈 Demon</span>}
            {achievements.has("neutral_master") && <span className="achievement-badge">⚖️ Balanced</span>}
            
            {/* Prestige Achievements */}
            {achievements.has("first_prestige") && <span className="achievement-badge">🔄 Prestige</span>}
            {achievements.has("prestige_master") && <span className="achievement-badge">🔄 Master</span>}
            {achievements.has("prestige_legend") && <span className="achievement-badge">🔄 Legend</span>}
            
            {/* Upgrade Achievements */}
            {achievements.has("upgrade_enthusiast") && <span className="achievement-badge">⬆️ Enthusiast</span>}
            {achievements.has("upgrade_master") && <span className="achievement-badge">⬆️ Master</span>}
            {achievements.has("upgrade_legend") && <span className="achievement-badge">⬆️ Legend</span>}
            
            {/* Customer Achievements */}
            {achievements.has("social_bartender") && <span className="achievement-badge">👥 Social</span>}
            {achievements.has("people_person") && <span className="achievement-badge">👥 Popular</span>}
            
            {/* Moral Choice Achievements */}
            {achievements.has("moral_philosopher") && <span className="achievement-badge">🤔 Philosopher</span>}
            {achievements.has("ethical_expert") && <span className="achievement-badge">🤔 Expert</span>}
            
            {/* Drink Achievements */}
            {achievements.has("drink_collector") && <span className="achievement-badge">🍷 Collector</span>}
            {achievements.has("drink_master") && <span className="achievement-badge">🍷 Master</span>}
            
            {/* Special Achievements */}
            {achievements.has("golden_moment") && <span className="achievement-badge">✨ Golden</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

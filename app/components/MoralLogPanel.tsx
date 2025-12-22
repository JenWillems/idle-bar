"use client";

import React from "react";
import type { LogEntry } from "../types";

interface MoralLogPanelProps {
  moralEffective: number;
  log: LogEntry[];
}

export default function MoralLogPanel({ moralEffective, log }: MoralLogPanelProps) {
  const getMoralColor = () => {
    if (moralEffective < 40) return '#c97d60';
    if (moralEffective > 90) return '#8b9a5b';
    return '#d4af37';
  };

  const getMoralLabel = () => {
    if (moralEffective < 40) return 'Low';
    if (moralEffective > 90) return 'Excellent';
    if (moralEffective > 70) return 'Good';
    return 'Fair';
  };

  return (
    <div className="moral-panel-redesign">
      {/* Moral Display - Prominent */}
      <div className="moral-display-card">
        <div className="moral-header">
          <span className="moral-label">Team Moral</span>
          <span className="moral-percentage" style={{ color: getMoralColor() }}>
            {moralEffective.toFixed(0)}%
          </span>
        </div>
        <div className="moral-status-badge" style={{ 
          background: `${getMoralColor()}20`,
          borderColor: getMoralColor(),
          color: getMoralColor()
        }}>
          {getMoralLabel()}
        </div>
        <div className="progress-bar-vintage">
          <div
            className="progress-bar-fill-vintage"
            style={{
              width: `${Math.min(100, moralEffective)}%`,
              background: `linear-gradient(90deg, ${getMoralColor()}, ${getMoralColor()}dd)`,
              boxShadow: `0 0 16px ${getMoralColor()}80`
            }}
          />
        </div>
      </div>

      {/* Event Log - Compact Scrollable */}
      <div className="log-panel-vintage">
        <div className="log-header">Event Log</div>
        <div className="log-list-vintage">
          {log.length === 0 ? (
            <div className="log-empty">No events yet...</div>
          ) : (
            log.map((entry) => (
              <div key={entry.id} className="log-entry-vintage">
                <span className="log-message">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

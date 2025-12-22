"use client";

import React from "react";
import type { LogEntry } from "../types";

interface MoralLogPanelProps {
  moralEffective: number;
  log: LogEntry[];
}

export default function MoralLogPanel({ moralEffective, log }: MoralLogPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Moral & Event Log</div>
          <div className="card-subtitle">
            In this bar, every choice counts. Moral dilemmas appear when you least expect them.
            Choose wisely, or choose quickly — both have their price.
          </div>
        </div>
      </div>

      <div className="moral-meter">
        <div className="moral-row">
          <span className="section-label">Team Moral</span>
          <span className="moral-value">{moralEffective.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, moralEffective)}%`,
              boxShadow:
                moralEffective < 40
                  ? "0 0 24px rgba(248, 113, 113, 0.45)"
                  : moralEffective > 90
                    ? "0 0 24px rgba(52, 211, 153, 0.5)"
                    : "0 0 24px rgba(251, 191, 36, 0.35)"
            }}
          />
          <div className="progress-bar-overlay" />
        </div>
      </div>

      <div className="log-list">
        {log.map((entry) => (
          <div key={entry.id} className="log-entry">
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}

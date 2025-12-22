"use client";

import React from "react";
import type { MoralChoice } from "../types";

interface MoralChoiceModalProps {
  activeChoice: MoralChoice;
  onClose: () => void;
  onChoice: (choiceIndex: number) => void;
}

export default function MoralChoiceModal({ activeChoice, onClose, onChoice }: MoralChoiceModalProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sketchy": return "🔍 Sketchy Deal";
      case "moral": return "⚖️ Moral Choice";
      case "opportunity": return "💎 Opportunity";
      case "dilemma": return "🤔 Dilemma";
      default: return type;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{activeChoice.title}</h2>
          <span className={`modal-type modal-type-${activeChoice.type}`}>
            {getTypeLabel(activeChoice.type)}
          </span>
        </div>
        
        <p className="modal-description">{activeChoice.description}</p>
        
        <div className="modal-choices">
          {activeChoice.choices.map((choice, idx) => (
            <button
              key={idx}
              className={`modal-choice ${
                choice.moral > 0 ? "modal-choice-positive" : "modal-choice-negative"
              }`}
              onClick={() => onChoice(idx)}
            >
              <div className="modal-choice-text">{choice.text}</div>
              {choice.consequence && (
                <div className="modal-choice-effects">
                  {choice.moral !== 0 && (
                    <span className={`modal-effect ${
                      choice.moral > 0 ? "effect-positive" : "effect-negative"
                    }`}>
                      Moral: {choice.moral > 0 ? "+" : ""}{choice.moral}
                    </span>
                  )}
                  {choice.money !== undefined && choice.money !== 0 && (
                    <span className={`modal-effect ${
                      choice.money > 0 ? "effect-positive" : "effect-negative"
                    }`}>
                      Money: {choice.money > 0 ? "+" : ""}€{choice.money}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
        
        <button className="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

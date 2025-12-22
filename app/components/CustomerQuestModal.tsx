"use client";

import React from "react";
import type { CustomerQuest } from "../types";

interface CustomerQuestModalProps {
  quest: CustomerQuest;
  onClose: () => void;
  onChoice: (choiceIndex: number) => void;
}

export default function CustomerQuestModal({ quest, onClose, onChoice }: CustomerQuestModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>{quest.customerSprite}</span>
            <h2 className="modal-title">{quest.title}</h2>
          </div>
          <span className={`modal-type modal-type-${quest.type}`}>
            {quest.type === "order" && "🍺 Order"}
            {quest.type === "tip" && "💰 Tip"}
            {quest.type === "special" && "⭐ Special"}
            {quest.type === "complaint" && "😠 Complaint"}
            {quest.type === "dilemma" && "🤔 Dilemma"}
          </span>
        </div>
        
        <p className="modal-description">{quest.description}</p>
        
        <div className="modal-choices">
          {quest.choices.map((choice, idx) => (
            <button
              key={idx}
              className={`modal-choice ${
                choice.moral < 0 ? "modal-choice-negative" : "modal-choice-positive"
              }`}
              onClick={() => onChoice(idx)}
            >
              <div className="modal-choice-text">{choice.text}</div>
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
                {choice.beer !== undefined && choice.beer !== 0 && (
                  <span className={`modal-effect ${
                    choice.beer > 0 ? "effect-positive" : "effect-negative"
                  }`}>
                    Beer: {choice.beer > 0 ? "+" : ""}{choice.beer}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button className="modal-close" onClick={onClose}>
          Refuse (customer leaves)
        </button>
      </div>
    </div>
  );
}

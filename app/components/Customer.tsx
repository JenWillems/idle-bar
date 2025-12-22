"use client";

import React from "react";
import type { Customer as CustomerType } from "../types";

interface CustomerProps {
  customer: CustomerType;
  onClick: () => void;
}

export default function Customer({ customer, onClick }: CustomerProps) {
  return (
    <div
      className="customer-pixel"
      style={{
        left: `${customer.x}%`,
        bottom: `${customer.y}%`, // Use bottom instead of top to align with white bar
        color: customer.color,
        cursor: customer.opportunity ? 'pointer' : 'default',
        transform: customer.direction === 'left' ? 'scaleX(-1)' : 'none',
        transition: customer.walking ? 'left 0.5s linear' : 'none'
      }}
      onClick={onClick}
    >
      <img 
        src={customer.sprite} 
        alt={customer.name}
        className="customer-sprite"
      />
      <div className="customer-name">{customer.name}</div>
      
      {/* Opportunity Icon */}
      {customer.opportunity && (
        <div className={`customer-opportunity ${customer.opportunity === "moral_dilemma" ? "moral-dilemma-indicator" : ""}`}>
          {customer.opportunity === "order" && "🍺"}
          {customer.opportunity === "tip" && "💰"}
          {customer.opportunity === "special" && "⭐"}
          {customer.opportunity === "complaint" && "😠"}
          {customer.opportunity === "moral_dilemma" && "⚖️"}
        </div>
      )}
      
      {/* Patience Bar */}
      <div className="customer-patience">
        <div 
          className="customer-patience-fill"
          style={{ 
            width: `${customer.patience}%`,
            background: customer.patience > 50 ? '#8b9a5b' : customer.patience > 25 ? '#c97d60' : '#8b0000'
          }}
        ></div>
      </div>
    </div>
  );
}


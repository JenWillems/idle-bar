"use client";

import React from "react";
import type { Customer } from "../types";

interface CustomerComponentProps {
  customer: Customer;
  onClick: () => void;
}

export default function CustomerComponent({ customer, onClick }: CustomerComponentProps) {
  const opportunityIcon = customer.opportunity === "moral_dilemma" 
    ? "/img/quest-mark.png" 
    : customer.opportunity 
    ? "/img/money-mark.png" 
    : null;

  return (
    <div
      className="customer-pixel"
      style={{
        left: `${customer.x}%`,
        bottom: `${customer.y}%`,
        cursor: customer.opportunity ? "pointer" : "default",
      }}
      {...(customer.opportunity ? { onClick } : {})}
    >
      {opportunityIcon && (
        <img
          src={opportunityIcon}
          alt="opportunity"
          className={`customer-opportunity ${
            customer.opportunity === "moral_dilemma" ? "moral-dilemma-indicator" : ""
          }`}
        />
      )}
      <img
        src={customer.sprite}
        alt={customer.name}
        className="customer-sprite"
      />
      <div className="customer-name">{customer.name}</div>
      <div className="customer-patience">
        <div
          className="customer-patience-fill"
          style={{
            width: `${Math.max(0, Math.min(100, customer.patience))}%`,
            background: customer.patience > 50 
              ? "linear-gradient(90deg, var(--success), var(--accent))" 
              : customer.patience > 25 
              ? "linear-gradient(90deg, var(--accent), var(--danger))" 
              : "var(--danger)",
          }}
        />
      </div>
    </div>
  );
}

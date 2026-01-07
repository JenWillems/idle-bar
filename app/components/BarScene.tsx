"use client";

import React from "react";
import CustomerComponent from "./Customer";
import type { Customer as CustomerType } from "../types";

interface BarSceneProps {
  customers: CustomerType[];
  onCustomerClick: (customerId: string) => void;
  barOpen: boolean;
  onToggleBar: () => void;
}

export default function BarScene({ customers, onCustomerClick, barOpen, onToggleBar }: BarSceneProps) {
  return (
    <div className="bar-scene">
      <div className="bar-controls">
        <button 
          className={`btn-small ${barOpen ? "btn-small-primary" : ""}`}
          onClick={onToggleBar}
          style={{ 
            backgroundColor: barOpen ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
            borderColor: barOpen ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
            color: barOpen ? "#86efac" : "#fca5a5"
          }}
        >
          {barOpen ? "🔴 CLOSE THE BAR" : "🟢 OPEN THE BAR"}
        </button>
      </div>
      <div className="bar-background">
        <div className="bar-counter"></div>
        <div className="bar-stools">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bar-stool" style={{ left: `${15 + i * 14}%` }}></div>
          ))}
        </div>
        
        {/* Customers - only show when bar is open */}
        {barOpen && customers.map((customer) => (
          <CustomerComponent
            key={customer.id}
            customer={customer}
            onClick={() => onCustomerClick(customer.id)}
          />
        ))}
      </div>
    </div>
  );
}

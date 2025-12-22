"use client";

import React from "react";
import Customer from "./Customer";
import type { Customer as CustomerType } from "../types";

interface BarSceneProps {
  customers: CustomerType[];
  onCustomerClick: (customerId: string) => void;
  onSpawnCustomer: () => void;
}

export default function BarScene({ customers, onCustomerClick, onSpawnCustomer }: BarSceneProps) {
  return (
    <div className="bar-scene">
      <div className="bar-controls">
        <button className="btn-small" onClick={onSpawnCustomer}>
          Let Customer In
        </button>
      </div>
      <div className="bar-background">
        <div className="bar-counter"></div>
        <div className="bar-stools">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bar-stool" style={{ left: `${15 + i * 14}%` }}></div>
          ))}
        </div>
        
        {/* Customers */}
        {customers.map((customer) => (
          <Customer
            key={customer.id}
            customer={customer}
            onClick={() => onCustomerClick(customer.id)}
          />
        ))}
      </div>
    </div>
  );
}

import { useCallback, useEffect } from "react";
import type { Customer, Upgrade, SkeletonPersonality } from "../types";
import { skeletonPersonalities, upgradeToCustomerMap, stoolPositions } from "../constants/skeletonPersonalities";
import type { GameStats } from "./useGameStats";

interface UseCustomerSpawningProps {
  barOpen: boolean;
  upgrades: Upgrade[];
  unlockedCustomers: Set<SkeletonPersonality>;
  servedCustomers: Map<string, { personality: SkeletonPersonality; lastServed: number }>;
  stats: GameStats;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setServedCustomers: React.Dispatch<React.SetStateAction<Map<string, { personality: SkeletonPersonality; lastServed: number }>>>;
  pushLog: (message: string) => void;
}

export function useCustomerSpawning({
  barOpen,
  upgrades,
  unlockedCustomers,
  servedCustomers,
  stats,
  customers,
  setCustomers,
  setServedCustomers,
  pushLog
}: UseCustomerSpawningProps) {
  const spawnCustomer = useCallback((forceSpawn = false) => {
    const barExpansionLevel = upgrades.find((u) => u.id === "bar_expansion")?.level ?? 0;
    const maxCustomers = 3 + barExpansionLevel; // Base 3, +1 per bar expansion level
    const currentUnlocked = Array.from(unlockedCustomers);
    const currentServed = Array.from(servedCustomers.values());
    
    if (!barOpen && !forceSpawn) return;
    if (currentUnlocked.length === 0) return;
    
    setCustomers((prevCustomers) => {
      const seatedCustomers = prevCustomers.filter((c: Customer) => !c.walking && c.seatIndex !== null);
      
      if (seatedCustomers.length >= maxCustomers) {
        return prevCustomers;
      }

      const occupiedSeats = new Set(
        seatedCustomers.map((c: Customer) => c.seatIndex as number)
      );

      const freeSeats = stoolPositions
        .map((_, index) => index)
        .filter((idx) => !occupiedSeats.has(idx));

      if (freeSeats.length === 0) return prevCustomers;

      const targetSeatIndex = freeSeats[Math.floor(Math.random() * freeSeats.length)];

      const now = Date.now();
      const fourMinutesAgo = now - (4 * 60 * 1000);
      
      const customersNeedingReturn = currentServed.filter(
        (served) => served.lastServed < fourMinutesAgo
      );
      
      let personality: SkeletonPersonality;
      let isReturning = false;
      
      if (customersNeedingReturn.length > 0) {
        const returningCustomer = customersNeedingReturn[Math.floor(Math.random() * customersNeedingReturn.length)];
        personality = returningCustomer.personality;
        isReturning = true;
      } else if (currentServed.length > 0 && Math.random() < 0.3) {
        const returningCustomer = currentServed[Math.floor(Math.random() * currentServed.length)];
        personality = returningCustomer.personality;
        isReturning = true;
      } else {
        personality = currentUnlocked[Math.floor(Math.random() * currentUnlocked.length)];
      }
      
      const personalityData = skeletonPersonalities[personality];
      
      if (isReturning) {
        pushLog(`🔄 ${personalityData.name} is back! Welcome back, regular customer!`);
        setServedCustomers((prev: Map<string, { personality: SkeletonPersonality; lastServed: number }>) => {
          const newMap = new Map(prev);
          newMap.set(personality, {
            personality,
            lastServed: Date.now()
          });
          return newMap;
        });
      }
      
      const personalitySeatMap: Record<SkeletonPersonality, number> = {
        deco: 0,
        evil: 1,
        flower: 2,
        rebel: 3,
        smoking: 4,
        witch: 5
      };
      
      const preferredSeat = personalitySeatMap[personality];
      const finalSeatIndex = freeSeats.includes(preferredSeat) ? preferredSeat : targetSeatIndex;
      
      const newCustomer: Customer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        name: personalityData.name,
        x: stoolPositions[finalSeatIndex],
        y: 20,
        seatIndex: finalSeatIndex,
        sprite: personalityData.image,
        personality,
        opportunity: null,
        opportunityTime: 0,
        patience: 50 + personalityData.traits.patience * 0.5,
        orderValue: stats.pricePerGlass * (1 + personalityData.traits.generosity * 0.01 + Math.random() * 0.3),
        color: personalityData.color,
        walking: false,
        direction: "right",
        timesOrdered: 0
      };

      // Very rare opportunity chance - only 10-15% of customers will order anything
      // Sometimes nobody orders anything (70-85% chance of no opportunity)
      setTimeout(() => {
        setCustomers((prev: Customer[]) =>
          prev.map((c: Customer) =>
            c.id === newCustomer.id
              ? {
                  ...c,
                  // Only 12% chance of any opportunity, and only if they haven't ordered before
                  opportunity: (Math.random() < 0.12 ? (Math.random() < 0.3 ? "moral_dilemma" : (["order", "tip", "special"] as any[])[Math.floor(Math.random() * 3)]) as any : null),
                  opportunityTime: Date.now()
                }
              : c
          )
        );
      }, 800);

      return [...prevCustomers, newCustomer];
    });
  }, [barOpen, unlockedCustomers, servedCustomers, upgrades, stats.pricePerGlass, pushLog, setCustomers, setServedCustomers]);

  useEffect(() => {
    if (!barOpen) return;
    
    let timeoutId: NodeJS.Timeout | null = null;
    let isActive = true;
    
    const scheduleSpawn = () => {
      if (!isActive) return;
      
      // Much slower spawn rate - base 15-25 seconds
      const baseInterval = 15000 + Math.random() * 10000;
      const spawnInterval = Math.max(8000, baseInterval);
      
      timeoutId = setTimeout(() => {
        if (!isActive) return;
        
        const barExpansionLevel = upgrades.find((u) => u.id === "bar_expansion")?.level ?? 0;
        const currentMaxCustomers = 3 + barExpansionLevel; // Base 3, +1 per bar expansion level
        
        // Always spawn only 1 customer at a time - slower, more relaxed pace
        let customersToSpawn = 1;
        
        customersToSpawn = Math.min(customersToSpawn, currentMaxCustomers);
        
        for (let i = 0; i < customersToSpawn; i++) {
          setTimeout(() => {
            if (isActive) {
              spawnCustomer();
            }
          }, i * 300);
        }
        
        if (isActive) {
          scheduleSpawn();
        }
      }, spawnInterval);
    };
    
    const initialDelay = 5000; // Wait 5 seconds before first customer
    timeoutId = setTimeout(() => {
      if (isActive && barOpen) {
        spawnCustomer();
        scheduleSpawn();
      }
    }, initialDelay);
    
    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [spawnCustomer, barOpen, upgrades]);

  return spawnCustomer;
}



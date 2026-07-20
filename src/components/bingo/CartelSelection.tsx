'use client';

import React, { useState } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BingoCard, BingoCardData } from '@/components/bingo/BingoCard';

// 1. Props interface is cleaned, playerCount is removed.
interface CartelSelectionProps {
  cartels: { id: number; board: BingoCardData }[];
  onBack: () => void;
  onPlay: (selectedIds: number[]) => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  timer: number;
  balance: number;
}

export function CartelSelection({ cartels, onBack, onPlay, selectedIds, setSelectedIds, timer, balance }: CartelSelectionProps) {
  const [error, setError] = useState<string | null>(null);

  const toggleCartel = (id: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter(i => i !== id);
      } else {
        const newStake = (prev.length + 1) * 10;
        if (balance < newStake) {
          setError("Insufficient balance");
          setTimeout(() => setError(null), 2000);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const stake = selectedIds.length * 10;
  const displayedCartels = cartels.slice(0, 400);

  return (
    <div className="h-screen bg-[#1e1b32] text-white flex flex-col font-body items-center">
      
      <header className="w-full max-w-md px-2 h-14 flex items-center justify-between flex-none bg-[#2c2849]">
        {/* ... Header content is unchanged ... */}
      </header>

      {/* 2. Stats Bar now has only 3 items, grid-cols-3 */}
      <section className="w-full max-w-md grid grid-cols-3 text-center bg-[#131121] flex-none">
         <StatBox label="Wallet" value={balance.toFixed(0)} />
         <StatBox label="Stake" value={error || stake} isError={!!error} />
         <StatBox label="Timer" value={`${timer}s`} isTimer />
      </section>

      <main className="w-full max-w-md flex-1 p-2 overflow-y-auto scrollbar-hide">
         {/* ... Main content is unchanged ... */}
      </main>

      <footer className="w-full max-w-md flex-none bg-black/20 pt-2">
         {/* ... Footer content is unchanged ... */}
      </footer>
    </div>
  );
}

// StatBox component remains the same
const StatBox = ({ label, value, isTimer = false, isError = false }: { label: string; value: string | number; isTimer?: boolean; isError?: boolean; }) => (
    <div className="py-2 border-r border-black/20 last:border-r-0">
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{label}</p>
        <p className={cn("font-bold text-lg", 
          isTimer ? "text-yellow-400" 
          : isError ? "text-red-500 text-xs" 
          : "text-white"
        )}>{value}</p>
    </div>
);

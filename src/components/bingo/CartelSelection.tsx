'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BingoCard } from './BingoCard';

interface CartelSelectionProps {
  cartels: { id: number; board: any }[];
  onBack: () => void;
  onPlay: (selectedIds: number[]) => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  timer: number;
  balance: number;
}

export function CartelSelection({ cartels, onBack, onPlay, selectedIds, setSelectedIds, timer, balance }: CartelSelectionProps) {
  
  const toggleCartel = (id: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter(i => i !== id);
      } else {
        if (prev.length < 4) {
          return [...prev, id];
        }
      }
      return prev;
    });
  };

  // Automatically transition to play when timer hits 0
  useEffect(() => {
    if (timer <= 0) {
      onPlay(selectedIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const stake = selectedIds.length * 10;
  const displayedCartels = cartels.slice(0, 400);

  return (
    // The `h-screen` and `flex-col` ensures the footer is pushed to the bottom
    <div className="h-screen bg-[#1e1b32] text-white flex flex-col font-body items-center">
      
      {/* Header */}
      <header className="w-full max-w-md px-2 h-14 flex items-center justify-between flex-none bg-[#2c2849]">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-black tracking-tight">Select Tickets</h1>
        <Button variant="ghost" size="sm" className="text-white h-8 px-2 flex items-center gap-1.5 hover:bg-white/10">
            <RotateCcw size={14} />
            <span className="text-xs font-semibold">Refresh</span>
        </Button>
      </header>

      {/* Stats Bar */}
      <section className="w-full max-w-md grid grid-cols-4 text-center bg-[#131121] flex-none">
         <StatBox label="Main Wallet" value={balance.toFixed(0)} />
         <StatBox label="Play Wallet" value="0" />
         <StatBox label="Stake" value={stake} />
         <StatBox label="Timer" value={`${timer}s`} isTimer />
      </section>

      {/* Scrollable Number Grid */}
      {/* `flex-1` makes this section take up all available space, pushing the footer down */}
      <main className="w-full max-w-md flex-1 p-2 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-8 gap-2">
          {displayedCartels.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCartel(c.id)}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all duration-200 border",
                  isSelected
                    ? "bg-green-500 border-green-400 text-white shadow-lg scale-110"
                    : "bg-[#2c2849] border-transparent text-white/70 hover:bg-[#423d6a]"
                )}
              >
                {c.id}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Section (Fixed) */}
      {/* This footer is not part of the scrollable area */}
      <footer className="w-full max-w-md flex-none bg-black/20 pt-2">
        <div className="min-h-[110px] flex items-center justify-center p-2">
          {selectedIds.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 w-full">
                  {/* Show placeholders for unselected cards to maintain layout */}
                  {Array.from({ length: 4 }).map((_, index) => {
                    const id = selectedIds[index];
                    if (!id) {
                        return <div key={`placeholder-${index}`} className="w-full h-full" />
                    }
                    const cartel = displayedCartels.find(c => c.id === id);
                    if (!cartel) return <div key={`placeholder-found-${index}`} />;
                    
                    return (
                      <div key={id} className="w-full animate-in zoom-in-95 fade-in-0 duration-300">
                          <BingoCard data={cartel.board} isMini={true} />
                      </div>
                    );
                  })}
              </div>
          ) : (
              <p className="text-sm text-white/40">Select a cartel to view board</p>
          )}
        </div>
      </footer>
    </div>
  );
}

const StatBox = ({ label, value, isTimer = false }: { label: string; value: string | number; isTimer?: boolean }) => (
    <div className="py-2 border-r border-black/20 last:border-r-0">
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{label}</p>
        <p className={cn("font-bold text-lg", isTimer ? "text-yellow-400" : "text-white")}>{value}</p>
    </div>
);

'use client';

import React from 'react';
import { ChevronLeft, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BingoCard } from './BingoCard';

interface CartelSelectionProps {
  cartels: { id: number; board: any }[];
  onBack: () => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  timer: number;
  balance: number;
  playerCount: number;
}

export function CartelSelection({ cartels, onBack, selectedIds, setSelectedIds, timer, balance, playerCount }: CartelSelectionProps) {
  const toggleCartel = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const stake = selectedIds.length * 10;

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-body overflow-hidden">
      {/* Header - Boxed */}
      <div className="px-4 h-14 flex items-center justify-between bg-[#14182d] border-b-4 border-black flex-none">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={onBack} className="text-white h-8 w-8 p-0 hover:bg-white/5 border border-white/10">
              <ChevronLeft size={22} />
           </Button>
           <h1 className="text-[14px] font-black tracking-[0.2em] uppercase">Game Arena</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-white/70 h-8 px-3 flex items-center gap-2 border border-white/10 hover:bg-white/5">
          <RotateCcw size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Refresh</span>
        </Button>
      </div>

      {/* Split Stats Bar */}
      <div className="grid grid-cols-4 gap-1 bg-black p-1 border-b-4 border-black flex-none">
        {[
          { label: 'MAIN', value: balance.toFixed(2) },
          { label: 'PLAYERS', value: playerCount.toString() },
          { label: 'STAKE', value: stake.toString() },
          { label: 'TIMER', value: `${timer}s`, isTimer: true },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-[#14182d] py-3 text-center border border-white/5 flex flex-col justify-center gap-1 shadow-inner",
              stat.isTimer && timer < 10 && "border-red-500/50 bg-red-900/10"
            )}
          >
            <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.1em] leading-none">{stat.label}</p>
            <p className={cn(
              "text-sm font-black tracking-tight",
              stat.isTimer && timer < 10 ? "text-red-500" : "text-white"
            )}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ID Selection Board - "Shertet" Glide Experience */}
      <div className="p-1.5 bg-black flex-none">
        <div className="h-[220px] overflow-y-auto scroll-smooth scrollbar-hide bg-[#0f1225] p-2 border-2 border-black shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] overscroll-contain snap-y snap-mandatory">
          <div className="grid grid-cols-12 gap-1.5">
            {cartels.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCartel(c.id)}
                className={cn(
                  "h-9 flex items-center justify-center rounded-sm text-[12px] font-black transition-all duration-300 border-2 snap-start",
                  selectedIds.includes(c.id)
                    ? "bg-[#ff6b00] text-white border-white/40 scale-105 z-10 shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                    : "bg-[#1f2937]/40 text-white/30 border-black hover:border-white/20 hover:bg-white/5"
                )}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Cards View - 5-Column Compact Grid */}
      <div className="flex-1 px-1 bg-black overflow-y-auto scrollbar-hide pb-24">
        <div className="grid grid-cols-5 gap-1.5 pt-2">
          {selectedIds.map(id => {
            const cartel = cartels.find(c => c.id === id);
            if (!cartel) return null;
            return (
              <div key={id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Delete Button & ID Header */}
                <div className="flex items-center justify-between mb-1 px-0.5">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">#{id}</span>
                  <button 
                    onClick={() => toggleCartel(id)}
                    className="w-4 h-4 bg-destructive hover:bg-destructive/80 rounded-[2px] flex items-center justify-center transition-colors shadow-sm active:scale-90"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
                
                <BingoCard 
                  data={cartel.board} 
                  id={id}
                  className="w-full border-black" 
                />
              </div>
            );
          })}
          {selectedIds.length === 0 && (
            <div className="col-span-5 flex flex-col items-center justify-center h-40 opacity-10">
               <div className="w-16 h-16 border-4 border-dashed border-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-black">?</span>
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.4em]">Select 1-5 Cards</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

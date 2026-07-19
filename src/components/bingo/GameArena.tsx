'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BingoCard } from './BingoCard';
import { cn } from '@/lib/utils';

interface GameArenaProps {
  onBack: () => void;
  cartels: { id: number; board: any }[];
  selectedIds: number[];
}

export function GameArena({ onBack, cartels, selectedIds }: GameArenaProps) {
  // Mock IDs from screenshot starting at 157
  const displayCartels = Array.from({ length: 72 }, (_, i) => ({
    id: 157 + i,
    board: cartels[i % cartels.length].board
  }));
  
  // Set initial selections based on the screenshot
  const [localSelected, setLocalSelected] = useState<number[]>(
    selectedIds.length > 0 ? selectedIds : [185, 200, 203]
  );

  const toggleLocalSelection = (id: number) => {
    setLocalSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex flex-col font-body items-center px-3 py-3">
      {/* Header */}
      <div className="w-full max-w-lg px-2 h-14 flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 bg-black/20">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </Button>
        <h1 className="text-lg font-black tracking-tight">Game Arena</h1>
      </div>

      {/* Stats Bar */}
      <div className="w-full max-w-[420px] px-2 mb-4">
        <div className="premium-panel rounded-2xl p-3 grid grid-cols-4 gap-2">
          {[
            { label: 'MAIN', value: '0' },
            { label: 'PLAY', value: '15' },
            { label: 'STAKE', value: '30' },
            { label: 'TIMER', value: '30 s', color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-[7px] text-white/30 font-black tracking-widest uppercase mb-1">{stat.label}</p>
              <p className={cn("text-sm font-black premium-text", stat.color || "text-white")}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Number Grid */}
      <div className="w-full max-w-[420px] px-2 mb-6">
        <div className="premium-panel premium-grid-surface rounded-2xl p-2 shadow-2xl h-[280px] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-12 gap-1">
            {displayCartels.map((c) => {
              const isSelected = localSelected.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleLocalSelection(c.id)}
                  className={cn(
                    "aspect-square rounded-[3px] flex items-center justify-center text-[8px] font-black transition-all duration-200 border border-white/10 premium-text",
                    isSelected
                      ? "bg-[linear-gradient(145deg,#ffb347_0%,#ff7b1f_45%,#9f3f0b_100%)] text-white shadow-[0_0_18px_rgba(255,123,31,0.45)] z-10" 
                      : "bg-[#1c223a]/70 text-white/50 hover:bg-[#26304d] hover:text-white/80"
                  )}
                >
                  {c.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="w-full max-w-[420px] px-2 pb-8">
        <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1">
          {localSelected.slice(0, 3).map(id => {
            const cartel = displayCartels.find(c => c.id === id);
            if (!cartel) return null;
            return (
              <div key={id} className="w-[86px] min-w-[86px] max-w-[105px] flex-none mx-1 sm:mx-1.5">
                <BingoCard 
                  data={cartel.board} 
                  className="scale-[0.8] sm:scale-[0.9] origin-top" 
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
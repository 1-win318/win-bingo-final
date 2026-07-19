'use client';

import React from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartelSelectionProps {
  cartels: { id: number; board: any }[];
  onBack: () => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  timer: number;
  balance: number;
  playerCount: number; // Keep for potential future use
}

export function CartelSelection({ cartels, onBack, selectedIds, setSelectedIds, timer, balance }: CartelSelectionProps) {
  const toggleCartel = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } 
      // No limit on selection
      return [...prev, id];
    });
  };

  const stake = selectedIds.length * 10; // Assuming 10 ETB per number selection

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans">
      
      {/* Header */}
      <div className="px-2 h-12 flex items-center justify-between bg-[#1a1a1a] border-b border-gray-700 flex-none">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white h-8 w-8 hover:bg-gray-700">
            <ChevronLeft size={20} />
        </Button>
        <h1 className="text-lg font-bold">EDIL BINGO</h1>
        <Button variant="ghost" size="sm" className="text-white h-8 px-2 flex items-center gap-1.5 hover:bg-gray-700">
            <RotateCcw size={14} />
            <span className="text-xs font-semibold">Refresh</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 text-center bg-[#1a1a1a] border-b border-gray-700 flex-none">
        <div className="py-2 border-r border-gray-700">
          <p className="text-xs text-gray-400">MAIN WALLET</p>
          <p className="font-bold text-sm">{balance.toFixed(0)}</p>
        </div>
        <div className="py-2 border-r border-gray-700">
          <p className="text-xs text-gray-400">PLAY WALLET</p>
          <p className="font-bold text-sm">0</p>
        </div>
        <div className="py-2 border-r border-gray-700">
          <p className="text-xs text-gray-400">STAKE</p>
          <p className="font-bold text-sm">{stake}</p>
        </div>
        <div className="py-2 relative">
          <p className="text-xs text-gray-400">TIMER</p>
          <p className="font-bold text-lg text-yellow-400">{timer}s</p>
        </div>
      </div>

      {/* Number Selection Board */}
      <div className="flex-1 p-3 bg-[#0d0d0d] overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 90 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => toggleCartel(num)} // We use the number itself as the ID
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-sm font-bold transition-all duration-200",
                selectedIds.includes(num)
                  ? "bg-yellow-500 text-black scale-105 shadow-lg"
                  : "bg-[#2c2c2c] text-white hover:bg-gray-600"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-[#1a1a1a] border-t border-gray-700 flex-none">
        <p className="text-center text-xs text-gray-400">Select a cartel to view board</p>
      </div>

    </div>
  );
}

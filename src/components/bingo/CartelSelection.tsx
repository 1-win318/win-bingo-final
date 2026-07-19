'use client';

import React from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
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

export function CartelSelection({ cartels, onBack, selectedIds, setSelectedIds, timer, balance }: CartelSelectionProps) {
  const toggleCartel = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const stake = selectedIds.length * 10;

  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col font-sans">
      
      {/* Header */}
      <div className="px-2 h-12 flex items-center justify-between bg-blue-900 border-b border-blue-700 flex-none">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white h-8 w-8 hover:bg-blue-700">
            <ChevronLeft size={20} />
        </Button>
        <h1 className="text-lg font-bold">EDIL BINGO</h1>
        <Button variant="ghost" size="sm" className="text-white h-8 px-2 flex items-center gap-1.5 hover:bg-blue-700">
            <RotateCcw size={14} />
            <span className="text-xs font-semibold">Refresh</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 text-center bg-blue-900 border-b border-blue-700 flex-none">
        <div className="py-2 border-r border-blue-700">
          <p className="text-xs text-gray-400">MAIN WALLET</p>
          <p className="font-bold text-sm">{balance.toFixed(0)}</p>
        </div>
        <div className="py-2 border-r border-blue-700">
          <p className="text-xs text-gray-400">PLAY WALLET</p>
          <p className="font-bold text-sm">0</p>
        </div>
        <div className="py-2 border-r border-blue-700">
          <p className="text-xs text-gray-400">STAKE</p>
          <p className="font-bold text-sm">{stake}</p>
        </div>
        <div className="py-2 relative">
          <p className="text-xs text-gray-400">TIMER</p>
          <p className="font-bold text-lg text-yellow-400">{timer}s</p>
        </div>
      </div>

      {/* Cartel Selection Board */}
      <div className="flex-1 p-3 bg-blue-950 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cartels.map(cartel => (
            <div
              key={cartel.id}
              onClick={() => toggleCartel(cartel.id)}
              className={cn(
                "cursor-pointer rounded-xl transition-all duration-200",
                selectedIds.includes(cartel.id)
                  ? "ring-4 ring-sky-500 shadow-lg"
                  : "ring-2 ring-blue-800 hover:ring-sky-400"
              )}
            >
              <BingoCard data={cartel.board} id={cartel.id} />
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-900 border-t border-blue-700 flex-none">
        <p className="text-center text-xs text-gray-400">Select up to 4 cartels to play.</p>
      </div>

    </div>
  );
}

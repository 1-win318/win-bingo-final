'use client';

import React from 'react';
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
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        if (prev.length < 4) {
          return [...prev, id];
        }
      }
      return prev;
    });
  };

  const stake = selectedIds.length * 10;
  const displayedCartels = cartels.slice(0, 400);

  return (
    <div className="min-h-screen bg-[#1e1b32] text-white flex flex-col font-body items-center">
      
      {/* Header */}
      <div className="w-full max-w-md px-2 h-14 flex items-center justify-between flex-none bg-[#2c2849]">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-black tracking-tight">Select Tickets</h1>
        <Button variant="ghost" size="sm" className="text-white h-8 px-2 flex items-center gap-1.5 hover:bg-white/10">
            <RotateCcw size={14} />
            <span className="text-xs font-semibold">Refresh</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="w-full max-w-md grid grid-cols-4 text-center bg-[#131121] flex-none">
         <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Main Wallet</p><p className="font-bold text-sm">{balance.toFixed(0)}</p></div>
        <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Play Wallet</p><p className="font-bold text-sm">0</p></div>
        <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Stake</p><p className="font-bold text-sm">{stake}</p></div>
        <div className="py-2 relative"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Timer</p><p className="font-bold text-lg text-yellow-400">{timer}s</p></div>
      </div>

      {/* Number Grid */}
      <div className="w-full max-w-md flex-1 p-2 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-10 gap-1.5">
          {displayedCartels.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCartel(c.id)}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 border-2",
                  isSelected
                    ? "bg-green-500 border-green-400 text-white shadow-lg scale-110"
                    : "bg-[#2c2849] border-[#423d6a] text-white/70 hover:bg-[#423d6a]"
                )}
              >
                {c.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Cards Preview */}
       <div className="w-full max-w-md flex-none p-2 bg-black/30">
        {selectedIds.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
                {selectedIds.map(id => {
                    const cartel = displayedCartels.find(c => c.id === id);
                    if (!cartel) return null;
                    return (
                      <div key={id} className="w-full">
                          <BingoCard data={cartel.board} isMini={true} />
                      </div>
                    );
                })}
            </div>
        ) : (
            <div className="h-[75px] flex items-center justify-center text-center">
                <p className="text-sm text-white/30">Select a ticket to view the board.</p>
            </div>
        )}
      </div>

      {/* Footer Play Button */}
      <div className="w-full max-w-md p-3 bg-[#131121] flex-none">
         <Button 
            size="lg"
            onClick={() => onPlay(selectedIds)}
            disabled={selectedIds.length === 0}
            className="w-full h-14 text-xl font-black tracking-wider bg-green-500 text-white hover:bg-green-600 rounded-xl disabled:bg-gray-600 disabled:opacity-50"
        >
          PLAY
        </Button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, X as CloseIcon } from 'lucide-react';
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
  
  const [viewingCartel, setViewingCartel] = useState<{ id: number; board: any } | null>(null);

  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCardSelectAndClose = () => {
    if (viewingCartel) {
      if (!selectedIds.includes(viewingCartel.id)) {
         if (selectedIds.length < 4) {
            setSelectedIds(prev => [...prev, viewingCartel.id]);
         }
      }
      setViewingCartel(null);
    }
  };

  const stake = selectedIds.length * 10;
  const displayedCartels = cartels.slice(0, 400);

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white flex flex-col font-body items-center">
      
      {viewingCartel && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#1e223a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs p-4 flex flex-col items-center animate-in zoom-in-90">
            <h3 className="text-sm font-bold text-white/50 mb-1">TICKET ID</h3>
            <p className="text-4xl font-black mb-4 text-white">{viewingCartel.id}</p>
            <div className="w-full max-w-[200px] mb-6">
              <BingoCard data={viewingCartel.board} />
            </div>
            <div className="w-full flex flex-col gap-2">
                <Button size="lg" className="w-full h-12 bg-green-500 text-white font-bold hover:bg-green-600" onClick={handleCardSelectAndClose}>
                    Select This Card
                </Button>
                <Button size="lg" variant="ghost" className="w-full h-12 text-white/60 hover:bg-white/10" onClick={() => setViewingCartel(null)}>
                    Close
                </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-md px-2 h-14 flex items-center justify-between flex-none bg-[#1c223a]">
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
      <div className="w-full max-w-md grid grid-cols-4 text-center bg-[#14182d] flex-none">
         <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Main Wallet</p><p className="font-bold text-sm">{balance.toFixed(0)}</p></div>
        <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Play Wallet</p><p className="font-bold text-sm">0</p></div>
        <div className="py-2 border-r border-black/20"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Stake</p><p className="font-bold text-sm">{stake}</p></div>
        <div className="py-2 relative"><p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Timer</p><p className="font-bold text-lg text-red-500">{timer}s</p></div>
      </div>

      {/* Number Grid */}
      <div className="w-full max-w-md flex-1 p-2 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-8 gap-1.5">
          {displayedCartels.map((c) => (
            <button
              key={c.id}
              onClick={() => setViewingCartel(c)}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 border",
                selectedIds.includes(c.id)
                  ? "bg-green-500 border-green-400 text-white shadow-lg"
                  : "bg-[#1e223a] border-white/10 text-white/70 hover:bg-[#26304d]"
              )}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cards Bar */}
      <div className="w-full max-w-md flex-none p-2 bg-black/30">
        <p className="text-[10px] text-center text-white/50 mb-2 uppercase font-bold tracking-wider">Selected Tickets ({selectedIds.length}/4)</p>
        {selectedIds.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
                {selectedIds.map(id => (
                    <div key={id} className="relative p-1.5 rounded-lg bg-[#1e223a] border border-white/10 flex items-center justify-center">
                        <span className="font-bold text-lg text-white">{id}</span>
                        <button onClick={() => handleSelectToggle(id)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                            <CloseIcon size={12} className="text-white" />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-[40px] flex items-center justify-center text-center">
                <p className="text-sm text-white/30">No tickets selected.</p>
            </div>
        )}
      </div>

      {/* Footer Play Button */}
      <div className="w-full max-w-md p-3 bg-[#14182d] flex-none">
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

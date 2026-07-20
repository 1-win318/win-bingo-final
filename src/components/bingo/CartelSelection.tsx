'use client';

import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BingoCard, BingoCardData } from '@/components/bingo/BingoCard';
import { WinInfo } from './ActiveGameView';

interface CartelSelectionProps {
  cartels: { id: number; board: BingoCardData }[];
  onBack: () => void;
  onPlay: (selectedIds: number[]) => void;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  timer: number;
  balance: number;
  playerCount: number;
  lastWinInfo: WinInfo | null;
}

export function CartelSelection({ cartels, onBack, onPlay, selectedIds, setSelectedIds, timer, balance, playerCount, lastWinInfo }: CartelSelectionProps) {
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
  const winningCard = lastWinInfo ? cartels.find(c => c.id === lastWinInfo.winnerId) : null;

  return (
    <div className="h-screen bg-[#1e1b32] text-white flex flex-col font-body items-center relative">
      
      {/* Winner Popup */}
      {lastWinInfo && winningCard && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-sm bg-gray-800/80 border-2 border-yellow-500/50 rounded-2xl shadow-2xl shadow-yellow-500/20 p-6 pt-4 text-center">
              <Crown className="w-14 h-14 text-yellow-400 mx-auto -mt-12 bg-gray-800 p-2 rounded-full border-2 border-yellow-500/50"/>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter my-2">BINGO!</h1>
              <p className="text-xl font-bold text-yellow-400 mb-3">{lastWinInfo.winnerName} WON!</p>
              <p className="text-xs font-semibold text-white/60">Winning Cartela: #{lastWinInfo.winnerId}</p>
              <div className="my-3 scale-90"><BingoCard data={winningCard.board} markedNumbers={new Set(lastWinInfo.winningLine)} winningLine={new Set(lastWinInfo.winningLine)} /></div>
              <a href="https://t.me/betesebbingo_bot" target="_blank" rel="noopener noreferrer" className="text-sky-400 text-sm font-bold mt-2">@betesebbingo_bot</a>
            </div>
          </div>
      )}

      {/* Header */}
      <header className="w-full max-w-md px-2 h-14 flex items-center justify-between flex-none bg-[#2c2849]">
          {/* Header content */}
      </header>

      {/* Stats Bar */}
      <section className="w-full max-w-md grid grid-cols-4 text-center bg-[#131121] flex-none">
         <StatBox label="Players" value={playerCount} />
         <StatBox label="Wallet" value={balance.toFixed(0)} />
         <StatBox label="Stake" value={error || stake} isError={!!error} />
         <StatBox label="Timer" value={`${timer}s`} isTimer />
      </section>

      {/* Scrollable Number Grid */}
      <main className="w-full max-w-md flex-1 p-2 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-8 gap-2">
          {displayedCartels.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCartel(c.id)}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all duration-200 border",
                selectedIds.includes(c.id)
                  ? "bg-green-500 border-green-400 text-white shadow-lg scale-110"
                  : "bg-[#2c2849] border-transparent text-white hover:bg-[#423d6a]"
              )}
            >
              {c.id}
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Section */}
      <footer className="w-full max-w-md flex-none bg-black/20 pt-2">
         {/* ... selected cards display ... */}
      </footer>
    </div>
  );
}

const StatBox = ({ label, value, isTimer = false, isError = false }: { label: string; value: string | number; isTimer?: boolean; isError?: boolean; }) => (
    <div className="py-2 border-r border-black/20 last:border-r-0">
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{label}</p>
        <p className={cn("font-bold text-lg", isTimer ? "text-yellow-400" : isError ? "text-red-500 text-xs" : "text-white")}>{value}</p>
    </div>
);

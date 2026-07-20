'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Crown, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { BingoCard, BingoCardData } from './BingoCard';
import { getWinningLine } from '@/lib/bingo-utils';

// --- TYPE DEFINITIONS ---
interface Player {
  id: string;
  name: string;
  cartelIds: number[];
}
export interface WinInfo {
  winnerName: string;
  winnerId: number;
  winningLine: (string | number)[];
  amount: number;
}
interface ActiveGameViewProps {
  onGameEnd: (winInfo: WinInfo | null) => void;
  selectedIds: number[];
  cartels: { id: number; board: BingoCardData }[];
  player: Player;
  otherPlayers: Player[];
}

// --- HELPER COMPONENTS ---
const NumberTracker = ({ calledNumbers }: { calledNumbers: number[] }) => (
  <div className="grid grid-cols-5 gap-1 p-1 bg-black/20 rounded-md">
    {Array.from({ length: 75 }, (_, i) => i + 1).map(num => {
      const isCalled = calledNumbers.includes(num);
      const letter = num <= 15 ? 'B' : num <= 30 ? 'I' : num <= 45 ? 'N' : num <= 60 ? 'G' : 'O';
      return (
        <div key={num} className={cn(
          "flex items-center justify-center h-6 rounded-sm text-xs font-bold transition-all duration-300",
          isCalled ? `bg-orange-500 text-white shadow-lg` : `bg-gray-700/50 text-gray-400`
        )}>
          {isCalled ? num : ''}
        </div>
      );
    })}
  </div>
);

const GameStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="text-center">
    <p className="text-[10px] text-gray-400 font-semibold uppercase">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

// --- MAIN COMPONENT ---
export function ActiveGameView({ onGameEnd, selectedIds, cartels, player, otherPlayers }: ActiveGameViewProps) {
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const [isAuto, setIsAuto] = useState(true);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  
  const allPlayers = useMemo(() => [player, ...otherPlayers].filter(p => p.cartelIds.length > 0), [player, otherPlayers]);
  const currentNumber = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;
  const betAmount = (selectedIds.length || 1) * 10;
  const derashAmount = (allPlayers.length * betAmount * 0.9).toFixed(0);

  // Game loop
  useEffect(() => {
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const drawNumber = () => setCalledNumbers(prev => {
      if (prev.length >= 75) { if (gameInterval.current) clearInterval(gameInterval.current); return prev; }
      const remaining = availableNumbers.filter(n => !prev.includes(n));
      return [...prev, remaining[Math.floor(Math.random() * remaining.length)]];
    });
    drawNumber();
    gameInterval.current = setInterval(drawNumber, 3000);
    return () => { if (gameInterval.current) clearInterval(gameInterval.current); };
  }, []);

  // Win check
  useEffect(() => {
    if (winInfo || !currentNumber) return;
    let winnerFound: WinInfo | null = null;
    
    const marksMap: Record<number, Set<number | string>> = {};
    allPlayers.forEach(p => p.cartelIds.forEach(id => { 
        marksMap[id] = new Set(['★', ...calledNumbers.filter(n => Object.values(cartels.find(c=>c.id === id)?.board || {}).flat().includes(n))]);
    }));

    for (const p of allPlayers) {
      for (const cartelId of p.cartelIds) {
        const card = cartels.find(c => c.id === cartelId);
        if (!card) continue;
        const winningLine = getWinningLine(card.board, marksMap[cartelId]);
        if (winningLine) {
          winnerFound = { winnerName: p.name, winnerId: cartelId, winningLine, amount: parseFloat(derashAmount) };
          setWinInfo(winnerFound);
          if (gameInterval.current) clearInterval(gameInterval.current);
          setTimeout(() => onGameEnd(winnerFound), 4000); // User requested 4 seconds
          return;
        }
      }
    }
  }, [calledNumbers, cartels, allPlayers, winInfo, onGameEnd, currentNumber, derashAmount]);

  const winningCard = winInfo ? cartels.find(c => c.id === winInfo.winnerId) : null;

  // --- RENDER --- //
  if (winInfo && winningCard) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-sm m-4 bg-gray-800/70 border-2 border-yellow-500/50 rounded-2xl shadow-2xl shadow-yellow-500/20 p-6 text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter my-2">BINGO!</h1>
          <p className="text-2xl font-bold text-yellow-400 mb-4">{winInfo.winnerName} WON!</p>
          <p className="text-sm font-semibold text-white/60">Winning Cartela: #{winInfo.winnerId}</p>
          <div className="my-4 scale-90"><BingoCard data={winningCard.board} markedNumbers={new Set(winInfo.winningLine)} winningLine={new Set(winInfo.winningLine)} /></div>
          <p className="text-xs text-white/50 animate-pulse">Returning to game selection...</p>
          <div className="mt-6 text-center"><a href="https://t.me/betesebbingo_bot" target="_blank" rel="noopener noreferrer" className="text-sky-400 text-sm font-bold">@betesebbingo_bot</a></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[#1e1b32] text-white flex flex-col font-body">
        {/* Header */}
        <header className="flex-none flex items-center justify-between p-2 bg-[#2c2849]">
            <h1 className="text-md font-bold">Beteseb Bingo</h1>
            <div>
                <Button variant="ghost" size="icon" onClick={() => {}}><MoreVertical size={20}/></Button>
                <Button variant="ghost" size="icon" onClick={() => onGameEnd(null)}><X size={20}/></Button>
            </div>
        </header>

        {/* Stats Bar */}
        <div className="flex-none grid grid-cols-5 gap-1 p-2 bg-black/20">
            <GameStat label="Game ID" value="BB3IWDBP"/>
            <GameStat label="Players" value={allPlayers.length}/>
            <GameStat label="Bet" value={betAmount}/>
            <GameStat label="Derash" value={derashAmount}/>
            <GameStat label="Called" value={`${calledNumbers.length}/75`}/>
        </div>

        <main className="flex-1 flex p-2 gap-2 overflow-hidden">
            {/* Left: Number Tracker */}
            <div className="w-[45%]">
                <NumberTracker calledNumbers={calledNumbers} />
            </div>

            {/* Right: Game Info */}
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex-none grid grid-cols-4 gap-1">
                    {calledNumbers.slice(-4).map((n, i) => (
                        <div key={i} className="h-8 bg-gray-600/50 rounded-md flex items-center justify-center text-sm font-bold">{n}</div>
                    ))}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/60 rounded-lg">
                    <span className="text-5xl font-black text-yellow-400 animate-pulse">{currentNumber}</span>
                </div>
                <div className="flex-none flex items-center justify-between p-2 bg-gray-800/60 rounded-lg">
                    <label htmlFor="auto-switch" className="font-bold text-sm">Automatic</label>
                    <Switch id="auto-switch" checked={isAuto} onCheckedChange={setIsAuto}/>
                </div>

                {selectedIds.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-800/60 rounded-lg p-4 -mt-16">
                        <h3 className="font-bold text-lg">Watching Only</h3>
                        <p className="text-xs text-gray-400 mt-1">የዚህን ዙር ጨዋታ እየተመለከቱ ነው። በሚቀጥለው ዙር ለመጫወት ቲኬት ይምረጡ።</p>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="destructive" onClick={() => onGameEnd(null)}>Leave</Button>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">Refresh</Button>
                </div>
            </div>
        </main>
        <footer className="text-center p-2 text-sm font-bold text-sky-400 bg-black/20">
            @betesebbingo_bot
        </footer>
    </div>
  );
}

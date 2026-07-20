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
    {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
      <div key={num} className={cn(
        "flex items-center justify-center h-6 rounded-sm text-xs font-bold transition-all duration-300",
        calledNumbers.includes(num) ? `bg-orange-500 text-white shadow-lg` : `bg-gray-700/50 text-gray-400`
      )}>{num}</div>
    ))}
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
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, Set<number | string>>>({});
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const [isAuto, setIsAuto] = useState(true);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  
  const allPlayers = useMemo(() => [player, ...otherPlayers].filter(p => p.cartelIds.length > 0), [player, otherPlayers]);
  const currentNumber = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;
  const betAmount = (player.cartelIds.length || 1) * 10;
  const derashAmount = (allPlayers.reduce((sum, p) => sum + p.cartelIds.length, 0) * 10 * 0.9).toFixed(0);

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

  // Win check and marks update
  useEffect(() => {
    if (winInfo || !currentNumber) return;

    const newMarks = { ...markedNumbers };
    let winnerFound: WinInfo | null = null;

    allPlayers.forEach(p => {
      p.cartelIds.forEach(cartelId => {
        const card = cartels.find(c => c.id === cartelId);
        if (!card) return;
        if (!newMarks[cartelId]) newMarks[cartelId] = new Set(['★']);
        if (Object.values(card.board).flat().includes(currentNumber)) {
          newMarks[cartelId].add(currentNumber);
        }
      });
    });

    for (const p of allPlayers) {
      if (winnerFound) break;
      for (const cartelId of p.cartelIds) {
        const card = cartels.find(c => c.id === cartelId);
        if (!card) continue;
        const winningLine = getWinningLine(card.board, newMarks[cartelId]);
        if (winningLine) {
          winnerFound = { winnerName: p.name, winnerId: cartelId, winningLine, amount: parseFloat(derashAmount) };
          break;
        }
      }
    }

    setMarkedNumbers(newMarks);

    if (winnerFound) {
      setWinInfo(winnerFound);
      if (gameInterval.current) clearInterval(gameInterval.current);
      setTimeout(() => onGameEnd(winnerFound), 4000);
    }
  }, [calledNumbers, cartels, allPlayers, winInfo, onGameEnd, derashAmount, markedNumbers]);

  const winningCard = winInfo ? cartels.find(c => c.id === winInfo.winnerId) : null;

  if (winInfo && winningCard) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
        {/* ... Winner screen ... */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[#1e1b32] text-white flex flex-col font-body">
        {/* Header */}
        <header className="flex-none flex items-center justify-between p-2 bg-[#2c2849]">
            <h1 className="text-md font-bold">Beteseb Bingo</h1>
            <div>
                <Button variant="ghost" size="icon"><MoreVertical size={20}/></Button>
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
            <div className="w-[45%] flex flex-col gap-2">
                <NumberTracker calledNumbers={calledNumbers} />
                <Button variant="destructive" size="sm" onClick={() => onGameEnd(null)}>Leave</Button>
            </div>

            {/* Right: Game Info & My Cards */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex-none grid grid-cols-4 gap-1">
                    {calledNumbers.slice(-4).reverse().map((n, i) => (
                        <div key={i} className="h-8 bg-gray-600/50 rounded-md flex items-center justify-center text-sm font-bold">{n}</div>
                    ))}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/60 rounded-lg">
                    <span className="text-5xl font-black text-yellow-400 animate-pulse">{currentNumber}</span>
                </div>
                
                {/* MY CARDS / WATCHING ONLY SECTION */}
                <div className="flex-[2] bg-gray-800/60 rounded-lg overflow-hidden flex flex-col">
                    {selectedIds.length > 0 ? (
                      <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-2">
                        {selectedIds.map(id => {
                          const cartel = cartels.find(c => c.id === id);
                          if (!cartel) return null;
                          return (
                            <div key={id}>
                              <p className="text-center text-xs font-bold mb-1 text-yellow-400">Ticket #{id}</p>
                              <BingoCard data={cartel.board} markedNumbers={markedNumbers[id]} />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <h3 className="font-bold text-lg">Watching Only</h3>
                        <p className="text-xs text-gray-400 mt-1">To play in the next round, please select tickets.</p>
                      </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

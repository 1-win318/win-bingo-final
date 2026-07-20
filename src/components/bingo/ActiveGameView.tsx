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

// --- HELPER FUNCTIONS & COMPONENTS ---

// Returns B, I, N, G, or O based on the number
const getBingoLetter = (number: number | null): string => {
    if (!number) return '';
    if (number <= 15) return 'B';
    if (number <= 30) return 'I';
    if (number <= 45) return 'N';
    if (number <= 60) return 'G';
    return 'O';
};

// New: The styled display for the currently called number
const CalledBall = ({ number }: { number: number | null }) => {
  const letter = getBingoLetter(number);
  const colors: Record<string, string> = {
    B: 'bg-blue-500',
    I: 'bg-red-500',
    N: 'bg-gray-400',
    G: 'bg-yellow-500',
    O: 'bg-green-500',
    '': 'bg-gray-700',
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black/20 p-3 rounded-lg">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-inner", colors[letter])}>
        {letter}
      </div>
      <div className="text-7xl font-bold text-white mt-1">{number}</div>
    </div>
  );
};


// Updated: Smaller number tracker
const NumberTracker = ({ calledNumbers }: { calledNumbers: number[] }) => (
  <div className="grid grid-cols-5 gap-1 p-1 bg-black/20 rounded-md">
    {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
      <div key={num} className={cn(
        "flex items-center justify-center aspect-square rounded-sm text-[10px] font-bold transition-all duration-300",
        calledNumbers.includes(num) ? `bg-orange-500 text-white shadow-lg` : `bg-gray-700/50 text-gray-400`
      )}>{num}</div>
    ))}
  </div>
);

const GameStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="text-center">
    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

// --- MAIN COMPONENT ---
export function ActiveGameView({ onGameEnd, selectedIds, cartels, player, otherPlayers }: ActiveGameViewProps) {
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, Set<number | string>>>({});
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  
  const allPlayersWithTickets = useMemo(() => [player, ...otherPlayers].filter(p => p.cartelIds.length > 0), [player, otherPlayers]);
  const betAmount = player.cartelIds.length * 10;
  const totalTickets = allPlayersWithTickets.reduce((sum, p) => sum + p.cartelIds.length, 0);
  const derashAmount = (totalTickets * 10 * 0.9).toFixed(0);
  const currentNumber = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

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

  useEffect(() => {
    if (winInfo || !currentNumber) return;
    const newMarks = { ...markedNumbers };
    let winnerFound: WinInfo | null = null;

    allPlayersWithTickets.forEach(p => {
      p.cartelIds.forEach(cartelId => {
        const card = cartels.find(c => c.id === cartelId);
        if (!card) return;
        if (!newMarks[cartelId]) newMarks[cartelId] = new Set(['★']);
        if (Object.values(card.board).flat().includes(currentNumber)) newMarks[cartelId].add(currentNumber);
      });
    });

    for (const p of allPlayersWithTickets) {
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
  }, [calledNumbers, cartels, allPlayersWithTickets, winInfo, onGameEnd, derashAmount, markedNumbers]);

  const winningCard = winInfo ? cartels.find(c => c.id === winInfo.winnerId) : null;

  if (winInfo && winningCard) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
          {/* Winner screen, unchanged */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[#1e1b32] text-white flex flex-col font-body">
        <header className="flex-none flex items-center justify-between p-2 bg-[#2c2849]">
          <h1 className="text-md font-bold">Beteseb Bingo</h1>
            <div><Button variant="ghost" size="icon" onClick={() => onGameEnd(null)}><X size={20}/></Button></div>
        </header>

        <div className="flex-none grid grid-cols-5 gap-1 py-2 px-1 bg-black/20">
            <GameStat label="Game ID" value="BB3IWDBP"/>
            <GameStat label="Players" value={allPlayersWithTickets.length}/>
            <GameStat label="Bet" value={betAmount}/>
            <GameStat label="Derash" value={derashAmount}/>
            <GameStat label="Called" value={`${calledNumbers.length}/75`}/>
        </div>

        {/* --- REBUILT LAYOUT --- */}
        <main className="flex-1 flex p-2 gap-2 overflow-hidden">
            {/* Left Column */}
            <div className="w-[150px] flex-none flex flex-col gap-2">
                <NumberTracker calledNumbers={calledNumbers} />
                <Button variant="destructive" size="sm" onClick={() => onGameEnd(null)}>Leave</Button>
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <CalledBall number={currentNumber} />
                
                <div className="flex-1 bg-black/20 rounded-lg overflow-hidden flex flex-col">
                    {selectedIds.length > 0 ? (
                      <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-3">
                        {selectedIds.map(id => {
                          const cartel = cartels.find(c => c.id === id);
                          if (!cartel) return null;
                          return (
                            <div key={id}>
                              <p className="text-center text-xs font-bold mb-1.5 text-yellow-400">Ticket #{id}</p>
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

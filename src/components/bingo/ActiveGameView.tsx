'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Crown, X, Users, LayoutGrid, Eye, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { BingoCard, BingoCardData } from './BingoCard';
import { getWinningLine } from '@/lib/bingo-utils';

// TYPE DEFINITIONS
interface Player {
  id: string;
  name: string;
  cartelIds: number[];
}
export interface WinInfo {
  winnerName: string;
  winnerId: number; // cartel ID
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

// --- COMPONENT --- //
export function ActiveGameView({ onGameEnd, selectedIds, cartels, player, otherPlayers }: ActiveGameViewProps) {
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, Set<number | string>>>({});
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'players'>('cards');
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const allPlayers = useMemo(() => [player, ...otherPlayers].filter(p => p.cartelIds.length > 0), [player, otherPlayers]);
  const currentNumber = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

  // Game loop to draw numbers
  useEffect(() => {
    const initialMarkings: Record<number, Set<number | string>> = {};
    selectedIds.forEach(id => { initialMarkings[id] = new Set(['★']); });
    setMarkedNumbers(initialMarkings);

    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    
    const drawNumber = () => setCalledNumbers(prev => {
      if (prev.length >= 75) { if (gameInterval.current) clearInterval(gameInterval.current); return prev; }
      const remaining = availableNumbers.filter(n => !prev.includes(n));
      const nextNum = remaining[Math.floor(Math.random() * remaining.length)];
      return [...prev, nextNum];
    });

    drawNumber();
    gameInterval.current = setInterval(drawNumber, 3000);
    return () => { if (gameInterval.current) clearInterval(gameInterval.current); };
  }, []);

  // Check for win on each new number
  useEffect(() => {
    if (winInfo || !currentNumber) return;

    let winnerFound: WinInfo | null = null;

    setMarkedNumbers(prevMarks => {
        const newMarks = { ...prevMarks };
        for (const p of allPlayers) {
            for (const cartelId of p.cartelIds) {
                const card = cartels.find(c => c.id === cartelId);
                if (!card) continue;

                const marks = new Set(newMarks[cartelId] || ['★']);
                if(Object.values(card.board).flat().includes(currentNumber)){
                  marks.add(currentNumber);
                }
                newMarks[cartelId] = marks;

                if (!winnerFound) {
                    const winningLine = getWinningLine(card.board, marks);
                    if (winningLine) {
                        winnerFound = { winnerName: p.name, winnerId: cartelId, winningLine, amount: 100 };
                        setWinInfo(winnerFound);
                        if (gameInterval.current) clearInterval(gameInterval.current);
                        setTimeout(() => onGameEnd(winnerFound), 8000); // Show win screen for 8s
                        break;
                    }
                }
            }
            if(winnerFound) break;
        }
        return newMarks;
    });
  }, [calledNumbers, cartels, allPlayers, winInfo, onGameEnd, currentNumber]);

  // --- RENDER LOGIC --- //
  const winningCard = winInfo ? cartels.find(c => c.id === winInfo.winnerId) : null;

  if (winInfo && winningCard) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-sm m-4 bg-gray-800/70 border-2 border-yellow-500/50 rounded-2xl shadow-2xl shadow-yellow-500/20 p-6 text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter my-2">BINGO!</h1>
          <p className="text-2xl font-bold text-yellow-400 mb-4">{winInfo.winnerName} WON!</p>
          <p className="text-sm font-semibold text-white/60">Winning Cartela: #{winInfo.winnerId}</p>
          <div className="my-4 scale-90"><BingoCard data={winningCard.board} markedNumbers={new Set(winInfo.winningLine)} winningLine={new Set(winInfo.winningLine)} /></div>
          <p className="text-xs text-white/50 animate-pulse">Auto-starting next game soon...</p>
          <div className="mt-6 text-center"><a href="https://t.me/betesebbingo_bot" target="_blank" rel="noopener noreferrer" className="text-sky-400 text-sm font-bold">@betesebbingo_bot</a></div>
        </div>
      </div>
    );
  }

  // --- MAIN GAME VIEW --- //
  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-body max-w-md mx-auto overflow-hidden relative">
        {/* Header, stats, etc. - A simplified version is used here */}
        <div className="h-12 px-4 flex items-center justify-between border-b-4 border-black bg-[#14182d] flex-none">
            <div className="flex items-center gap-4"><h1 className="text-[12px] font-black uppercase tracking-[0.2em]">ቢንጎ አሬና</h1></div>
            <div className="flex items-center gap-3 bg-black/60 px-3 py-1 rounded-sm border border-white/10">
                <Volume2 className="w-4 h-4 text-primary" />
                <div className="flex items-center gap-2"><span className="text-[8px] font-black text-white/50 uppercase tracking-widest">AUTO</span><Switch className="scale-[0.7]" checked={true} /></div>
            </div>
        </div>
        {/* Main Content */}
        <div className="flex flex-1 p-1 gap-1 bg-black overflow-hidden">
            {/* Left Side */}
            <div className="w-[42%] flex flex-col bg-[#0f1225] border-2 border-black overflow-hidden">
                {/* Number grid can be added here */}
            </div>
            {/* Right Side */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="h-24 bg-[#1e223a] border-2 border-black flex flex-col items-center justify-center relative">
                    <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">{currentNumber || '--'}</span>
                    <div className="mt-1 text-[7px] font-black text-primary/40 uppercase tracking-[0.6em]">'ቁጥር እየወጣ ነው'</div>
                </div>
                <div className="flex-1 flex flex-col bg-[#14182d] border-2 border-black overflow-hidden relative">
                    <div className="flex-none grid grid-cols-2 text-center bg-black/30">
                        <button onClick={() => setActiveTab('cards')} className={cn("py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2", activeTab === 'cards' ? "bg-[#14182d] text-primary" : "text-white/40")}><LayoutGrid size={12}/> My Cards</button>
                        <button onClick={() => setActiveTab('players')} className={cn("py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2", activeTab === 'players' ? "bg-[#14182d] text-primary" : "text-white/40")}><Users size={12}/> Players</button>
                    </div>
                    <div className="flex-1 h-full overflow-y-auto p-1 scrollbar-hide">
                        {activeTab === 'cards' ? (
                            <div className="grid grid-cols-2 gap-2 pb-8">
                                {selectedIds.map(id => {
                                    const cartel = cartels.find(c => c.id === id);
                                    if (!cartel) return null;
                                    return (
                                        <div key={id} className="relative pt-4 w-full">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#ff6b00] border border-black text-white text-[7px] font-black px-2 py-0.5 rounded-full z-10 uppercase">#{id}</div>
                                            <BingoCard data={cartel.board} markedNumbers={markedNumbers[id]} />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-2 text-white/80">
                                {allPlayers.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-sm text-xs mb-1">
                                        <span className={`font-bold ${p.id === player.id ? 'text-primary' : ''}`}>{p.name}</span>
                                        <span className="font-black text-sm">{p.cartelIds.length}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Eye, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { BingoCard } from './BingoCard';
import { checkBingoWin } from '@/lib/bingo-utils';
import { bingoCallCommentary } from '@/ai/flows/bingo-call-commentary-flow';

interface ActiveGameViewProps {
  onLeave: () => void;
  onWin?: (amount: number) => void;
  selectedIds?: number[];
  cartels?: { id: number; board: any }[];
  playerCount: number;
  playerId: string;
}

export function ActiveGameView({ onLeave, onWin, selectedIds = [], cartels = [], playerCount, playerId }: ActiveGameViewProps) {
  const [isAutomatic, setIsAutomatic] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<Record<number, Set<number | string>>>({});
  const [derash, setDerash] = useState(100); // Fixed pool for demo
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  const currentNumber = calledNumbers[calledNumbers.length - 1];
  const hasSelectedCards = selectedIds.length > 0;

  const playCalledNumberSound = async (number: number) => {
    if (!isSoundEnabled) return;
    try {
      const result = await bingoCallCommentary({ bingoNumber: number });
      console.log("AI Commentary:", result.commentary);
    } catch (e) {
      console.error("AI call failed", e);
    }
  };

  const playWinSound = () => {
    if (!isSoundEnabled || typeof window === 'undefined') return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    void audio.play().catch(() => undefined);
  };
  
  const getLetter = (num: number) => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  };

  const columns = ['B', 'I', 'N', 'G', 'O'] as const;
  const colColors = {
    B: 'bg-blue-600',
    I: 'bg-indigo-600',
    N: 'bg-pink-500',
    G: 'bg-green-500',
    O: 'bg-orange-500',
  };

  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => {
        if (winnerId !== null && onWin) {
          onWin(derash);
        } else {
          onLeave();
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, winnerId, onLeave, onWin, derash]);

  useEffect(() => {
    const initialMarkings: Record<number, Set<number | string>> = {};
    selectedIds.forEach(id => {
      initialMarkings[id] = new Set(['★', 'FREE']);
    });
    setMarkedNumbers(initialMarkings);

    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    
    const drawNumber = () => {
      setCalledNumbers(prev => {
        if (prev.length >= 75 || isGameOver) {
          if (gameInterval.current) clearInterval(gameInterval.current);
          return prev;
        }
        const remaining = availableNumbers.filter(n => !prev.includes(n));
        const randomIndex = Math.floor(Math.random() * remaining.length);
        const nextNum = remaining[randomIndex];
        return [...prev, nextNum];
      });
    };

    drawNumber();
    gameInterval.current = setInterval(drawNumber, 3000);

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, [selectedIds, isGameOver]);

  useEffect(() => {
    if (isGameOver || !currentNumber) return;
    playCalledNumberSound(currentNumber);
  }, [currentNumber, isGameOver]);

  useEffect(() => {
    if (isGameOver || !isAutomatic || !currentNumber) return;

    setMarkedNumbers(prev => {
      const next = { ...prev };
      let changed = false;

      selectedIds.forEach(id => {
        const card = cartels.find(c => c.id === id);
        if (card) {
          const marks = new Set(prev[id]);
          let found = false;
          
          Object.values(card.board).forEach((col: any) => {
            if (col.includes(currentNumber)) {
              marks.add(currentNumber);
              found = true;
            }
          });

          if (found) {
            next[id] = marks;
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [currentNumber, isAutomatic, selectedIds, cartels, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    
    let foundWinnerId: number | null = null;
    selectedIds.forEach(id => {
      const card = cartels.find(c => c.id === id);
      const marks = markedNumbers[id];
      if (card && marks && checkBingoWin(card.board, marks)) {
        foundWinnerId = id;
      }
    });

    if (foundWinnerId !== null) {
      setWinnerId(foundWinnerId);
      setIsGameOver(true);
      playWinSound();
      if (gameInterval.current) clearInterval(gameInterval.current);
    }
  }, [markedNumbers, selectedIds, cartels, isGameOver]);

  const handleCellClick = (cardId: number, value: number | string) => {
    if (isAutomatic || isGameOver) return;
    if (typeof value === 'number' && !calledNumbers.includes(value)) return;
    
    setMarkedNumbers(prev => {
      const marks = new Set(prev[cardId]);
      if (marks.has(value)) {
        marks.delete(value);
      } else {
        marks.add(value);
      }
      return { ...prev, [cardId]: marks };
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-body max-w-md mx-auto overflow-hidden relative">
      {isGameOver && winnerId && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-gradient-to-b from-primary/30 to-black border-4 border-primary rounded-3xl p-10 shadow-[0_0_100px_rgba(34,197,94,0.4)] animate-in zoom-in-95 duration-500">
            <Trophy className="w-24 h-24 text-primary mx-auto mb-6" />
            <h2 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase italic drop-shadow-lg">BINGO!</h2>
            <div className="text-primary font-black text-3xl mb-4 uppercase tracking-[0.2em]">Card #{winnerId} Wins!</div>
            <div className="text-white font-black text-xl mb-8">Prize: {derash} ETB</div>
            <div className="flex items-center justify-center gap-3">
               <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
               <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/70">Starting New Round...</span>
            </div>
          </div>
        </div>
      )}

      <div className="h-12 px-4 flex items-center justify-between border-b-4 border-black bg-[#14182d] flex-none">
        <div className="flex items-center gap-4">
          <X className="w-6 h-6 text-white/70 cursor-pointer hover:text-white" onClick={onLeave} />
          <h1 className="text-[12px] font-black uppercase tracking-[0.2em]">Live Arena</h1>
        </div>
        <div className="flex items-center gap-3 bg-black/60 px-3 py-1 rounded-sm border border-white/10">
           <button onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
             {isSoundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-destructive" />}
           </button>
           <div className="flex items-center gap-2">
             <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">AUTO</span>
             <Switch className="scale-[0.7]" checked={isAutomatic} onCheckedChange={setIsAutomatic} disabled={isGameOver} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-px bg-black p-px border-b-4 border-black flex-none">
        {[
          { label: 'GAME', value: playerId },
          { label: 'PLAYERS', value: playerCount.toString() },
          { label: 'BET', value: '10' },
          { label: 'POOL', value: derash.toString() },
          { label: 'CALLS', value: calledNumbers.length.toString() },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e223a] py-2 flex flex-col items-center justify-center">
            <p className="text-[7px] text-white/40 font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <p className="text-[11px] font-black uppercase text-primary leading-none truncate max-w-full px-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-1 p-1 gap-1 bg-black overflow-hidden">
        <div className="w-[42%] flex flex-col bg-[#0f1225] border-2 border-black overflow-hidden">
          <div className="grid grid-cols-5 gap-px bg-black border-b-2 border-black">
            {columns.map(col => (
              <div key={col} className={cn(colColors[col], "text-white text-[10px] font-black py-2.5 text-center uppercase border-r border-black/20")}>{col}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-5 gap-px bg-black overflow-y-auto scrollbar-hide">
            {columns.map(col => (
              <div key={col} className="flex flex-col gap-px">
                {Array.from({ length: 15 }).map((_, i) => {
                  const startMap: any = { B: 1, I: 16, N: 31, G: 46, O: 61 };
                  const num = startMap[col] + i;
                  const isCurrent = num === currentNumber;
                  const isCalled = calledNumbers.includes(num);
                  return (
                    <div key={i} className={cn("h-7 flex items-center justify-center text-[11px] font-black border-b border-r border-black", 
                      isCurrent ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.7)]" 
                      : isCalled ? "bg-amber-500 text-black" 
                      : "bg-[#14182d] text-white/5")}>
                      {num}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-start gap-1 flex-none h-10 px-2 bg-[#14182d] border-2 border-black overflow-x-auto scrollbar-hide">
            {[...calledNumbers].reverse().slice(1, 15).map((n, i) => (
              <div key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-white/60">
                {getLetter(n)}-{n}
              </div>
            ))}
          </div>

          <div className="h-24 bg-[#1e223a] border-2 border-black flex flex-col items-center justify-center relative shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
             <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black italic tracking-tighter", currentNumber ? colColors[getLetter(currentNumber)].replace('bg-', 'text-') : 'text-white/20')}>
                  {currentNumber ? getLetter(currentNumber) : ''}
                </span>
                <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  {currentNumber ? currentNumber : '--'}
                </span>
             </div>
             <div className="mt-1 text-[7px] font-black text-primary/40 uppercase tracking-[0.6em]">
                {isGameOver ? 'ROUND ENDED' : 'CALLING NOW'}
             </div>
          </div>

          <div className="flex-1 bg-[#14182d] border-2 border-black overflow-hidden relative">
             <div className="h-full overflow-y-auto p-1 scrollbar-hide">
                {hasSelectedCards ? (
                  <div className="grid grid-cols-2 gap-2 pb-8">
                     {selectedIds.map(id => {
                        const cartel = cartels.find(c => c.id === id);
                        if (!cartel) return null;
                        return (
                          <div key={id} className="relative pt-4 w-full">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#ff6b00] border border-black text-white text-[7px] font-black px-2 py-0.5 rounded-full z-10 uppercase">#{id}</div>
                            <BingoCard 
                              data={cartel.board} 
                              markedNumbers={markedNumbers[id]} 
                              onCellClick={(val) => handleCellClick(id, val)} 
                            />
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <Eye className="w-12 h-12 text-primary/40" />
                    <h2 className="text-xl font-black text-white uppercase italic">Watching Mode</h2>
                    <p className="text-[12px] text-white/60 font-medium">የዚህ ዙር ጨዋታ ተጀምሯል:: አዲስ ዙር እስኪጀምር ይጠብቁ::</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

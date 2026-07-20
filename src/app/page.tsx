'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HomeDashboard } from '@/components/bingo/HomeDashboard';
import { CartelSelection } from '@/components/bingo/CartelSelection';
import { ActiveGameView, WinInfo } from '@/components/bingo/ActiveGameView';
import { BottomNav } from '@/components/bingo/BottomNav';
import { generateBingoCard } from '@/lib/bingo-utils';

// TYPES AND CONSTANTS
interface SimulatedPlayer {
  id: string;
  name: string;
  cartelIds: number[];
}
const sampleNames = ["Dani", "Hana", "Alex", "Sara", "Mike", "Nati", "Beti", "John", "Sami", "Lili"];
const GAME_DURATION = 35;

// --- COMPONENT --- //
export default function LuckyBingo() {
  const [currentPage, setCurrentPage] = useState<'home' | 'selection' | 'active-game' | 'scores' | 'history' | 'wallet' | 'profile'>('home');
  const [selectedCartels, setSelectedCartels] = useState<number[]>([]);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [balance, setBalance] = useState(0); // 1. Initial balance is 0
  const [simulatedPlayers, setSimulatedPlayers] = useState<SimulatedPlayer[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('You');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const cartels = useMemo(() => Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, board: generateBingoCard() })), []);

  useEffect(() => {
    // 2. Simulate fetching balance from a database
    setBalance(500);
    setIsLoaded(true);
  }, []);

  // Game timer logic for selection screen
  useEffect(() => {
    let gameTimer: NodeJS.Timeout;
    if (currentPage === 'selection') {
      gameTimer = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handlePlay(selectedCartels);
            return GAME_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(gameTimer);
  }, [currentPage, selectedCartels, balance]);

  // Player simulation logic
  useEffect(() => {
    if (currentPage === 'selection') {
        const numPlayers = Math.floor(Math.random() * 15) + 10; 
        const players: SimulatedPlayer[] = [];
        const availableCartelIds = Array.from({ length: 1000 }, (_, i) => i + 1).filter(id => !selectedCartels.includes(id));

        for (let i = 0; i < numPlayers; i++) {
            const cartelCount = Math.floor(Math.random() * 4) + 1;
            const assignedCartels = [];
            for (let j = 0; j < cartelCount; j++) {
                if (availableCartelIds.length > 0) {
                    const randIndex = Math.floor(Math.random() * availableCartelIds.length);
                    assignedCartels.push(availableCartelIds.splice(randIndex, 1)[0]);
                }
            }
            players.push({ 
                id: `sim-${i}`,
                name: sampleNames[Math.floor(Math.random() * sampleNames.length)], 
                cartelIds: assignedCartels
            });
        }
        setSimulatedPlayers(players);
    }
  }, [currentPage]);

  const handleGameEnd = (winInfo: WinInfo | null) => {
    if (winInfo && winInfo.winnerName === playerName) {
      setBalance(prev => prev + winInfo.amount);
    }
    setCurrentPage('selection');
    setSelectedCartels([]);
    setTimer(GAME_DURATION);
  };
  
  const handlePlay = (ids: number[]) => {
      if (ids.length === 0) return;
      const stake = ids.length * 10;
      if (balance >= stake) {
        setBalance(b => b - stake);
        setSelectedCartels(ids);
        setCurrentPage('active-game');
      } else {
        console.log("Not enough balance to play.");
      }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary font-black animate-pulse uppercase tracking-[0.4em]">ቢንጎ እየተዘጋጀ ነው...</div></div>;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'selection':
        return (
          <CartelSelection 
            cartels={cartels} 
            onBack={() => setCurrentPage('home')}
            onPlay={handlePlay}
            selectedIds={selectedCartels}
            setSelectedIds={setSelectedCartels}
            timer={timer}
            balance={balance}
            // 3. Removed playerCount from here
          />
        );
      case 'active-game':
        return (
          <ActiveGameView 
            onGameEnd={handleGameEnd} 
            selectedIds={selectedCartels}
            cartels={cartels}
            player={{id: playerId, name: playerName, cartelIds: selectedCartels}}
            otherPlayers={simulatedPlayers}
          />
        );
      default:
        return <HomeDashboard onPlay={() => {setCurrentPage('selection'); setTimer(GAME_DURATION);}} balance={balance} playerId={playerId} />;
    }
  };

  return (
      <div className="app-shell min-h-screen w-full bg-[#05070a] text-white font-body overflow-x-hidden">
          <main className={currentPage !== 'active-game' ? "pb-24" : "h-screen"}>
              {renderContent()}
          </main>
          {currentPage !== 'active-game' && (
              <BottomNav activeTab={currentPage === 'selection' ? 'home' : currentPage} onTabChange={(tab) => setCurrentPage(tab)} />
          )}
      </div>
  );
}

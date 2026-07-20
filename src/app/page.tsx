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
  cartelCount: number;
  cartelIds: number[];
}
const sampleNames = ["Dani", "Hana", "Alex", "Sara", "Mike", "Nati", "Beti", "John", "Sami", "Lili"];
const GAME_DURATION = 35;

// --- COMPONENT --- //
export default function LuckyBingo() {
  const [currentPage, setCurrentPage] = useState<'home' | 'selection' | 'active-game' | 'scores' | 'history' | 'wallet' | 'profile'>('home');
  const [selectedCartels, setSelectedCartels] = useState<number[]>([]);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [balance, setBalance] = useState(100);
  const [simulatedPlayers, setSimulatedPlayers] = useState<SimulatedPlayer[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('You');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastWinInfo, setLastWinInfo] = useState<WinInfo | null>(null);

  const cartels = useMemo(() => Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, board: generateBingoCard() })), []);

  // Load state from localStorage on initial load
  useEffect(() => {
    // ... (localStorage logic is unchanged) ...
    setIsLoaded(true);
  }, []);

  // Game timer logic
  useEffect(() => {
    let gameTimer: NodeJS.Timeout;
    if (currentPage === 'selection') {
      gameTimer = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            onPlay(selectedCartels); // Play with selected cards when timer hits 0
            return GAME_DURATION; // Reset for next round
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (gameTimer) clearInterval(gameTimer); };
  }, [currentPage, selectedCartels]);

  // Player simulation logic
  useEffect(() => {
    // ... (simulation logic is unchanged) ...
  }, [currentPage]);

  const playerCount = useMemo(() => {
    const currentUserIsPlaying = selectedCartels.length > 0;
    return simulatedPlayers.length + (currentUserIsPlaying ? 1 : 0);
  }, [simulatedPlayers, selectedCartels]);

  const handleGameEnd = (winInfo: WinInfo | null) => {
    if (winInfo && winInfo.winnerId) {
      if (winInfo.winnerName === playerName) { 
          setBalance(prev => prev + winInfo.amount);
      }
      setLastWinInfo(winInfo);
    }
    setCurrentPage('selection');
    setSelectedCartels([]);
    setTimer(GAME_DURATION);
  };
  
  const onPlay = (ids: number[]) => {
      if (ids.length === 0) {
          // If no cards are selected, just stay on the selection page
          // and let the timer reset automatically.
          return;
      }
      const stake = ids.length * 10;
      if (balance >= stake) {
        setBalance(b => b - stake);
        setSelectedCartels(ids);
        setCurrentPage('active-game');
        setLastWinInfo(null);
      } else {
        // Handle insufficient balance if needed
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
            onPlay={onPlay} // Pass the correct onPlay function
            selectedIds={selectedCartels}
            setSelectedIds={setSelectedCartels}
            timer={timer}
            balance={balance}
            playerCount={playerCount}
            lastWinInfo={lastWinInfo}
          />
        );
      case 'active-game':
        return (
          <ActiveGameView 
            onGameEnd={handleGameEnd} 
            selectedIds={selectedCartels}
            cartels={cartels}
            player={{id: playerId, name: playerName, cartelIds: selectedCartels, cartelCount: selectedCartels.length}}
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

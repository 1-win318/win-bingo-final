'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HomeDashboard } from '@/components/bingo/HomeDashboard';
import { CartelSelection } from '@/components/bingo/CartelSelection';
import { ActiveGameView, WinInfo } from '@/components/bingo/ActiveGameView';
import { BottomNav } from '@/components/bingo/BottomNav';
import { generateBingoCard } from '@/lib/bingo-utils';

// Expanded player simulation to include names
interface SimulatedPlayer {
  id: string;
  name: string; // Add name
  cartelCount: number;
  cartelIds: number[];
}

const sampleNames = ["Dani", "Hana", "Alex", "Sara", "Mike", "Nati", "Beti", "John", "Sami", "Lili"];

export default function LuckyBingo() {
  const [currentPage, setCurrentPage] = useState<'home' | 'selection' | 'active-game' | 'scores' | 'history' | 'wallet' | 'profile'>('home');
  const [selectedCartels, setSelectedCartels] = useState<number[]>([]);
  const [timer, setTimer] = useState(35);
  const [balance, setBalance] = useState(0);
  const [simulatedPlayers, setSimulatedPlayers] = useState<SimulatedPlayer[]>([]);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('You'); // Player's own name
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastWinInfo, setLastWinInfo] = useState<WinInfo | null>(null);

  const cartels = useMemo(() => Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    board: generateBingoCard()
  })), []);

  useEffect(() => {
    // Restore state from localStorage
    const saved = localStorage.getItem('lucky_bingo_state');
    let initialBalance = 1000; // Default balance

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.balance !== undefined) {
          initialBalance = parsed.balance;
        } 
        if (parsed.currentPage) setCurrentPage(parsed.currentPage);
        if (parsed.selectedIds) setSelectedCartels(parsed.selectedIds);
      } catch (e) {
        // Keep default balance
      }
    }
    
    // Give the user 100 birr for testing as requested
    setBalance(initialBalance + 100);

    let savedPlayerId = localStorage.getItem('lucky_bingo_player_id');
    if (!savedPlayerId) {
      savedPlayerId = 'P-' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('lucky_bingo_player_id', savedPlayerId);
    }
    setPlayerId(savedPlayerId);
    setIsLoaded(true);
  }, []);

  // ... (the rest of the component remains the same)

  // Effect to simulate other players with names and cartel IDs
  useEffect(() => {
    let simulationTimer: NodeJS.Timeout;

    const updatePlayers = () => {
      setSimulatedPlayers(prevPlayers => {
        let players = [...prevPlayers];
        // Add new player
        if (Math.random() < 0.1 && players.length < 50) {
          const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
          const cartelCount = Math.ceil(Math.random() * 4);
          const cartelIds = Array.from({ length: cartelCount }, () => Math.floor(1 + Math.random() * 1000));
          players.push({ id: 'SIM-' + Math.random().toString(36).substr(2, 9), name, cartelCount, cartelIds });
        }
        // Remove a player
        if (Math.random() < 0.05 && players.length > 5) {
          players.splice(Math.floor(Math.random() * players.length), 1);
        }
        return players;
      });
    };

    if (currentPage === 'selection') {
      const initialPlayerCount = Math.floor(5 + Math.random() * 15);
      const initialPlayers: SimulatedPlayer[] = Array.from({ length: initialPlayerCount }, () => {
        const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const cartelCount = Math.ceil(Math.random() * 4);
        const cartelIds = Array.from({ length: cartelCount }, () => Math.floor(1 + Math.random() * 1000));
        return { id: 'SIM-' + Math.random().toString(36).substr(2, 9), name, cartelCount, cartelIds };
      });
      setSimulatedPlayers(initialPlayers);
      simulationTimer = setInterval(updatePlayers, 2500);
    } else {
        setSimulatedPlayers([]); // Clear players when not in selection
    }

    return () => {
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, [currentPage]);

  const playerCount = useMemo(() => {
    const currentUserIsPlaying = selectedCartels.length > 0;
    const otherPlayersCount = simulatedPlayers.length;
    return otherPlayersCount + (currentUserIsPlaying ? 1 : 0);
  }, [simulatedPlayers, selectedCartels]);

  const handleGameEnd = (winInfo: WinInfo | null) => {
    if (winInfo && winInfo.winnerId) {
      if(winInfo.winnerName === playerName) { // Check if the user won
          setBalance(prev => prev + winInfo.amount);
      }
      setLastWinInfo(winInfo);
    }
    setCurrentPage('selection');
    setSelectedCartels([]);
    setTimer(35);
  };
  
  const handlePlay = (ids: number[]) => {
      if (ids.length > 0) {
        const stake = ids.length * 10;
        if (balance >= stake) {
          setBalance(b => b - stake);
          setSelectedCartels(ids);
          setCurrentPage('active-game');
          setLastWinInfo(null); // Clear previous win info
        } 
      }
      setTimer(35);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-black animate-pulse uppercase tracking-[0.4em]">ቢንጎ እየተዘጋጀ ነው...</div>
      </div>
    );
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
            playerCount={playerCount}
            lastWinInfo={lastWinInfo} // Pass win info to show on selection screen
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
        return <HomeDashboard onPlay={() => setCurrentPage('selection')} balance={balance} playerId={playerId} />;
    }
  };

  return (
      <div className="app-shell min-h-screen w-full bg-[#05070a] text-white font-body overflow-x-hidden">
          <main className={currentPage !== 'active-game' ? "pb-24" : "h-screen"}>
              {renderContent()}
          </main>
          {currentPage !== 'active-game' && (
              <BottomNav 
                  activeTab={currentPage === 'selection' ? 'home' : currentPage} 
                  onTabChange={(tab) => setCurrentPage(tab)} 
              />
          )}
      </div>
  );
}

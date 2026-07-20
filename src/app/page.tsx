'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HomeDashboard } from '@/components/bingo/HomeDashboard';
import { CartelSelection } from '@/components/bingo/CartelSelection';
import { ActiveGameView } from '@/components/bingo/ActiveGameView';
import { BottomNav } from '@/components/bingo/BottomNav';
import { generateBingoCard } from '@/lib/bingo-utils';

export default function LuckyBingo() {
  const [currentPage, setCurrentPage] = useState<'home' | 'selection' | 'active-game' | 'scores' | 'history' | 'wallet' | 'profile'>('home');
  const [selectedCartels, setSelectedCartels] = useState<number[]>([]);
  const [timer, setTimer] = useState(35);
  const [balance, setBalance] = useState(1000.00); 
  const [playerCount, setPlayerCount] = useState(12);
  const [playerId, setPlayerId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const cartels = useMemo(() => Array.from({ length: 400 }, (_, i) => ({
    id: i + 1,
    board: generateBingoCard()
  })), []);

  useEffect(() => {
    const saved = localStorage.getItem('lucky_bingo_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentPage) setCurrentPage(parsed.currentPage);
        if (parsed.selectedIds) setSelectedCartels(parsed.selectedIds);
        if (parsed.balance !== undefined) setBalance(parsed.balance);
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    } else {
      setBalance(1000.00);
    }

    let savedPlayerId = localStorage.getItem('lucky_bingo_player_id');
    if (!savedPlayerId) {
      savedPlayerId = 'P-' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('lucky_bingo_player_id', savedPlayerId);
    }
    setPlayerId(savedPlayerId);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lucky_bingo_state', JSON.stringify({
        currentPage,
        selectedIds: selectedCartels,
        balance
      }));
    }
  }, [currentPage, selectedCartels, balance, isLoaded]);

  useEffect(() => {
    let gameTimer: NodeJS.Timeout;
    if (currentPage === 'selection') {
      gameTimer = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (selectedCartels.length === 0) {
              return 35;
            }
            const stake = selectedCartels.length * 10;
            if (balance >= stake) {
              setBalance(b => b - stake);
              setCurrentPage('active-game');
            } else {
              setSelectedCartels([]);
              return 35;
            }
            return 35;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [currentPage, selectedCartels, balance]);

  const handleStartSession = () => {
    setCurrentPage('selection');
    setTimer(35);
  };

  const handleGameEnd = (wonAmount: number) => {
    if (wonAmount > 0) {
      setBalance(prev => prev + wonAmount);
    }
    setCurrentPage('selection');
    setSelectedCartels([]);
    setTimer(35);
  };

  const renderContent = () => {
    if (!isLoaded) return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="text-primary font-black animate-pulse uppercase tracking-[0.4em]">ቢንጎ እየተዘጋጀ ነው...</div>
      </div>
    );

    switch (currentPage) {
      case 'home':
        return <HomeDashboard onPlay={handleStartSession} balance={balance} playerId={playerId} />;
      case 'selection':
        return (
          <CartelSelection 
            cartels={cartels} 
            onBack={() => setCurrentPage('home')}
            onPlay={(ids) => {
              if (ids.length > 0) {
                const stake = ids.length * 10;
                if (balance >= stake) {
                  setBalance(b => b - stake);
                  setSelectedCartels(ids);
                  setCurrentPage('active-game');
                }
              }
            }}
            selectedIds={selectedCartels}
            setSelectedIds={setSelectedCartels}
            timer={timer}
            balance={balance}
          />
        );
      case 'active-game':
        return (
          <ActiveGameView 
            onLeave={() => handleGameEnd(0)} 
            onWin={(amount) => handleGameEnd(amount)}
            selectedIds={selectedCartels}
            cartels={cartels}
            playerCount={playerCount}
            playerId={playerId}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white/20 italic">{currentPage}</h2>
            <p className="text-sm text-white/40 mt-2 font-bold uppercase tracking-widest">በቅርቡ ይጠብቁ</p>
            <button 
              onClick={() => setCurrentPage('home')}
              className="mt-8 text-primary font-black text-xs underline underline-offset-4 tracking-[0.2em]"
            >
              ተመለስ
            </button>
          </div>
        );
    }
  };

  const showBottomNav = ['home', 'scores', 'history', 'wallet', 'profile'].includes(currentPage);

  return (
    <div className="app-shell min-h-screen w-full bg-[#05070a] text-white font-body overflow-x-hidden">
      <main className={showBottomNav ? "pb-24" : ""}>
        {renderContent()}
      </main>

      {showBottomNav && (
        <BottomNav 
          activeTab={currentPage === 'selection' ? 'home' : currentPage} 
          onTabChange={(tab) => setCurrentPage(tab)} 
        />
      )}
    </div>
  );
}

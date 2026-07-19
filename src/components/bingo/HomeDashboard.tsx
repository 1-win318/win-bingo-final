'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface HomeDashboardProps {
  onPlay: () => void;
  balance: number;
  playerId: string; // Keep playerId for potential future use, but won't display it
}

export function HomeDashboard({ onPlay, balance }: HomeDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl shadow-lg p-8 text-center">
        
        <h2 className="text-xl font-light text-gray-300">Welcome to</h2>
        <h1 className="text-6xl font-extrabold text-white my-2">LUCKY BINGO</h1>

        <p className="text-gray-400 text-sm mb-6">CHOOSE YOUR STAKE</p>

        <Button 
          size="lg"
          onClick={onPlay}
          className="w-full h-16 text-2xl font-black tracking-wider bg-green-500 text-white hover:bg-green-600 rounded-xl"
        >
          PLAY 10
        </Button>

        <div className="mt-6">
          <span className="text-gray-400 text-xs font-bold">WALLET BALANCE</span>
          <p className="text-white font-bold text-lg">{balance.toFixed(0)}</p>
        </div>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Wallet, Gamepad2, History } from 'lucide-react';

interface HomeDashboardProps {
  onPlay: () => void;
  balance: number;
  playerId: string;
}

export function HomeDashboard({ onPlay, balance, playerId }: HomeDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070a] text-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-primary font-black tracking-[0.4em] text-xs uppercase opacity-80">እንኳን ደህና መጡ</h2>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            LUCKY <span className="text-primary">BINGO</span>
          </h1>
        </div>

        <div className="premium-panel rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">የአሁኑ ሂሳብ</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white tracking-tighter">{balance.toLocaleString()}</span>
                <span className="text-primary font-black text-xs uppercase">ብር</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Wallet className="text-primary w-6 h-6" />
            </div>
          </div>

          <Button 
            size="lg"
            onClick={onPlay}
            className="w-full h-20 text-2xl font-black tracking-wider bg-primary text-black hover:bg-primary/90 rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ጨዋታ ጀምር (10)
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-2">
             <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[8px] font-black uppercase text-white/40">ያሸነፉት</span>
                <span className="text-xs font-black">0 ብር</span>
             </div>
             <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1">
                <History className="w-4 h-4 text-blue-400" />
                <span className="text-[8px] font-black uppercase text-white/40">የተጫወቱት</span>
                <span className="text-xs font-black">0</span>
             </div>
          </div>
        </div>

        <div className="text-center">
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">ተጫዋች መታወቂያ: {playerId}</p>
        </div>
      </div>
    </div>
  );
}

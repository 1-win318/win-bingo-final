'use client';

import React from 'react';
import { Wallet, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HomeDashboardProps {
  onPlay: () => void;
  balance: number;
  playerId: string;
}

export function HomeDashboard({ onPlay, balance, playerId }: HomeDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center space-y-12 max-w-md mx-auto">
      <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-5xl font-black text-foreground leading-tight tracking-tighter">
          LUCKY <br /><span className="text-primary">BINGO</span>
        </h1>
      </div>
      
      <Card className="w-full bg-card/50 border-white/5 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in-95 delay-150 duration-700">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center group">
            <span className="text-muted-foreground text-sm font-medium tracking-wide">PLAYER ID</span>
            <span className="text-foreground font-bold font-mono text-lg bg-white/5 px-3 py-1 rounded">{playerId || '#------'}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Wallet size={20} />
              </div>
              <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Balance</span>
            </div>
            <span className="text-primary font-black text-2xl tracking-tight">
              {balance.toFixed(2)} <span className="text-xs ml-1 opacity-60">ETB</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Button 
        size="lg"
        onClick={onPlay}
        className="w-full h-16 text-lg font-black tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
      >
        PLAY 10
        <ChevronRight className="ml-2 w-5 h-5" />
      </Button>

    </div>
  );
}

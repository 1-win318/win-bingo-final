'use client';

import React from 'react';
import { Gamepad2, Trophy, Clock, Briefcase, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: 'home', icon: Gamepad2, label: 'GAME' },
    { id: 'scores', icon: Trophy, label: 'SCORES' },
    { id: 'history', icon: Clock, label: 'HISTORY' },
    { id: 'wallet', icon: Briefcase, label: 'WALLET' },
    { id: 'profile', icon: UserCircle, label: 'PROFILE' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f1225] border-t border-white/5 px-2 py-2 flex justify-around items-center z-50 h-16">
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id || (activeTab === 'selection' && id === 'home');
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative",
              isActive ? "text-[#1ed760]" : "text-white/30 hover:text-white/60"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[7px] font-black tracking-widest uppercase">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

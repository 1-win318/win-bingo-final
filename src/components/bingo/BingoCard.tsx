'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { BingoCardData } from '@/lib/bingo-utils';
import { cn } from '@/lib/utils';

interface BingoCardProps {
  data: BingoCardData;
  id?: number;
  className?: string;
  onCellClick?: (num: number | string) => void;
  markedNumbers?: Set<number | string>;
}

export function BingoCard({ data, id, className, onCellClick, markedNumbers }: BingoCardProps) {
  const columns = ['B', 'I', 'N', 'G', 'O'] as const;

  if (!data) return null;

  const getHeaderColor = (col: string) => {
    switch(col) {
      case 'B': return 'premium-header-blue'; 
      case 'I': return 'premium-header-indigo'; 
      case 'N': return 'premium-header-pink'; 
      case 'G': return 'premium-header-green'; 
      case 'O': return 'premium-header-orange'; 
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={cn("premium-bingo-card p-0.5 border-2 border-black/30 rounded-xl shadow-[0_18px_35px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col w-full select-none", className)}>
      <div className="grid grid-cols-5 gap-[2px]">
        {columns.map(col => (
          <div 
            key={col} 
            className={cn(
              getHeaderColor(col), 
              "text-white font-black text-[7px] sm:text-[8px] h-3.5 sm:h-4 text-center uppercase tracking-[0.2em] flex items-center justify-center leading-none border-b border-black/20 premium-text"
            )}
          >
            {col}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-5 gap-[2px] mt-[2px] p-[1px]">
        {columns.map(col => (
          <div key={col} className="flex flex-col gap-[2px]">
            {(data[col] || []).map((val, i) => {
              const isFree = val === 'FREE' || val === '★';
              const isMarked = markedNumbers?.has(val);
              
              return (
                <div
                  key={`${col}-${i}`}
                  onClick={() => onCellClick?.(val)}
                  className={cn(
                    "aspect-square flex items-center justify-center transition-all cursor-pointer active:scale-95 leading-none rounded-[3px] premium-cell",
                    isMarked || isFree
                      ? "premium-cell-marked" 
                      : "bg-[#f8f9fa] text-black hover:bg-white"
                  )}
                >
                  {isFree ? (
                    <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
                  ) : (
                    <span className="text-[10px] sm:text-[12px] font-black tracking-[0.08em] leading-none premium-text">{val}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

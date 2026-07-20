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
  isMini?: boolean; // New prop to control size
}

export function BingoCard({ data, id, className, onCellClick, markedNumbers, isMini = false }: BingoCardProps) {
  const columns = ['B', 'I', 'N', 'G', 'O'] as const;

  if (!data) return null;

  const getHeaderColor = (col: string) => {
    // ... (color logic is unchanged)
  };

  return (
    <div className={cn(
      "premium-bingo-card border-2 border-black/30 rounded-xl shadow-[0_18px_35px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col w-full select-none",
      isMini ? "p-[1px]" : "p-0.5", // Smaller padding for mini version
      className
    )}>
      <div className="grid grid-cols-5 gap-[2px]">
        {columns.map(col => (
          <div 
            key={col} 
            className={cn(
              getHeaderColor(col), 
              "text-white font-black text-center uppercase flex items-center justify-center leading-none border-b border-black/20 premium-text",
              isMini ? "text-[6px] h-3 tracking-widest" : "text-[8px] h-4 tracking-[0.2em]"
            )}
          >
            {col}
          </div>
        ))}
      </div>
      
      <div className={cn("grid grid-cols-5", isMini ? "gap-[1px] mt-[1px] p-0" : "gap-[2px] mt-[2px] p-[1px]")}>
        {columns.map(col => (
          <div key={col} className={cn("flex flex-col", isMini ? "gap-[1px]" : "gap-[2px]")}>
            {(data[col] || []).map((val, i) => {
              const isFree = val === 'FREE' || val === '★';
              const isMarked = markedNumbers?.has(val);
              
              return (
                <div
                  key={`${col}-${i}`}
                  onClick={() => onCellClick?.(val)}
                  className={cn(
                    "aspect-square flex items-center justify-center transition-all cursor-pointer active:scale-95 leading-none",
                    isMini ? "rounded-[2px]" : "rounded-[3px]",
                    isMarked || isFree
                      ? "premium-cell-marked"
                      : "bg-[#f8f9fa] text-black hover:bg-white"
                  )}
                >
                  {isFree ? (
                    <Star className={cn("fill-current", isMini ? "w-2 h-2" : "w-2.5 h-2.5")} />
                  ) : (
                    <span className={cn("font-black leading-none premium-text", isMini ? "text-[10px] tracking-tight" : "text-[12px] tracking-[0.08em]")}>{val}</span>
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

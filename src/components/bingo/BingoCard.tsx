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
  isMini?: boolean;
}

export function BingoCard({ data, id, className, onCellClick, markedNumbers, isMini = false }: BingoCardProps) {
  const columns = ['B', 'I', 'N', 'G', 'O'] as const;

  if (!data) return null;

  // CORRECTED: Using vibrant Tailwind colors for headers
  const getHeaderColor = (col: string) => {
    switch(col) {
      case 'B': return 'bg-blue-600'; 
      case 'I': return 'bg-red-600'; 
      case 'N': return 'bg-purple-600'; 
      case 'G': return 'bg-yellow-600'; 
      case 'O': return 'bg-green-600'; 
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={cn(
      "bingo-card border-2 border-black/30 rounded-lg shadow-lg overflow-hidden flex flex-col w-full select-none",
      isMini ? "p-[1px]" : "p-0.5",
      className
    )}>
      <div className={cn("grid grid-cols-5", isMini ? "gap-[1px]" : "gap-[2px]")}>
        {columns.map(col => (
          <div 
            key={col} 
            className={cn(
              getHeaderColor(col),
              "text-white font-black text-center uppercase flex items-center justify-center leading-none border-b border-black/20",
              isMini ? "text-[8px] h-4 tracking-wider" : "text-lg h-8"
            )}
          >
            {col}
          </div>
        ))}
      </div>
      
      <div className={cn("grid grid-cols-5 bg-gray-200", isMini ? "gap-[1px] mt-[1px]" : "gap-[2px] mt-[2px]")}>
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
                    "aspect-square flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 leading-none",
                    isMini ? "rounded-[2px]" : "rounded-md",
                    isMarked || isFree
                      ? "bg-orange-500 text-white shadow-inner" 
                      : "bg-white text-gray-800 hover:bg-gray-50"
                  )}
                >
                  {isFree ? (
                    <Star className={cn("fill-current text-white", isMini ? "w-3 h-3" : "w-5 h-5")} />
                  ) : (
                    <span className={cn("font-bold", isMini ? "text-sm" : "text-lg")}>{val}</span>
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

export type BingoCardData = {
  B: (number | string)[];
  I: (number | string)[];
  N: (number | string)[];
  G: (number | string)[];
  O: (number | string)[];
};

export const generateBingoCard = (): BingoCardData => {
  const columns: any = { B: [], I: [], N: [], G: [], O: [] };
  const ranges: Record<string, [number, number]> = { 
    B: [1, 15], 
    I: [16, 30], 
    N: [31, 45], 
    G: [46, 60], 
    O: [61, 75] 
  };
  
  Object.keys(columns).forEach(col => {
    const [min, max] = ranges[col];
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    columns[col] = Array.from(nums).sort((a, b) => a - b);
  });
  columns.N[2] = '★'; // Center free space
  return columns as BingoCardData;
};

/**
 * Checks for a Bingo win and returns the winning line.
 * @returns An array of the winning numbers/symbols, or null if no win.
 */
export function getWinningLine(card: BingoCardData, markedValues: Set<number | string>): (number | string)[] | null {
  const cols = ['B', 'I', 'N', 'G', 'O'] as const;

  // 1. Check Verticals (Columns)
  for (const col of cols) {
    const columnLine = card[col];
    if (columnLine.every(val => markedValues.has(val))) {
      return columnLine;
    }
  }

  // 2. Check Horizontals (Rows)
  for (let row = 0; row < 5; row++) {
    const rowLine = cols.map(col => card[col][row]);
    if (rowLine.every(val => markedValues.has(val))) {
      return rowLine;
    }
  }

  // 3. Check Diagonal (Top-Left to Bottom-Right)
  const diag1 = [card.B[0], card.I[1], card.N[2], card.G[3], card.O[4]];
  if (diag1.every(val => markedValues.has(val))) {
    return diag1;
  }

  // 4. Check Diagonal (Bottom-Left to Top-Right)
  const diag2 = [card.B[4], card.I[3], card.N[2], card.G[1], card.O[0]];
  if (diag2.every(val => markedValues.has(val))) {
    return diag2;
  }

  return null; // No win found
}

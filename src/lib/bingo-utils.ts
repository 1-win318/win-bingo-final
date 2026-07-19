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
 * Checks if a set of marked numbers constitutes a Bingo win (one line).
 */
export function checkBingoWin(card: BingoCardData, markedValues: Set<number | string>): boolean {
  const cols = ['B', 'I', 'N', 'G', 'O'] as const;

  // 1. Check Verticals (Columns)
  for (const col of cols) {
    if (card[col].every(val => markedValues.has(val))) return true;
  }

  // 2. Check Horizontals (Rows)
  for (let row = 0; row < 5; row++) {
    if (cols.every(col => markedValues.has(card[col][row]))) return true;
  }

  // 3. Check Diagonal (Top-Left to Bottom-Right)
  const diag1 = [
    card.B[0],
    card.I[1],
    card.N[2],
    card.G[3],
    card.O[4]
  ];
  if (diag1.every(val => markedValues.has(val))) return true;

  // 4. Check Diagonal (Bottom-Left to Top-Right)
  const diag2 = [
    card.B[4],
    card.I[3],
    card.N[2],
    card.G[1],
    card.O[0]
  ];
  if (diag2.every(val => markedValues.has(val))) return true;

  return false;
}

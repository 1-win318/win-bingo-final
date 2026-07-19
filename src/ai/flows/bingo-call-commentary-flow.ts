'use server';
/**
 * @fileOverview An AI agent that generates engaging commentary for called bingo numbers.
 *
 * - bingoCallCommentary - A function that generates commentary for a given bingo number.
 * - BingoCallCommentaryInput - The input type for the bingoCallCommentary function.
 * - BingoCallCommentaryOutput - The return type for the bingoCallCommentary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BingoCallCommentaryInputSchema = z.object({
  bingoNumber: z.number().int().min(1).max(75).describe('The bingo number that has been called.'),
});
export type BingoCallCommentaryInput = z.infer<typeof BingoCallCommentaryInputSchema>;

const BingoCallCommentaryOutputSchema = z.object({
  commentary: z.string().describe('An engaging and descriptive commentary for the called bingo number.'),
});
export type BingoCallCommentaryOutput = z.infer<typeof BingoCallCommentaryOutputSchema>;

export async function bingoCallCommentary(input: BingoCallCommentaryInput): Promise<BingoCallCommentaryOutput> {
  return bingoCallCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bingoCallCommentaryPrompt',
  input: {schema: BingoCallCommentaryInputSchema},
  output: {schema: BingoCallCommentaryOutputSchema},
  prompt: `You are an enthusiastic and engaging bingo caller. When a bingo number is called, you provide a short, descriptive, and fun commentary for it. Make it sound exciting!

Here is the bingo number: {{{bingoNumber}}}`,
});

const bingoCallCommentaryFlow = ai.defineFlow(
  {
    name: 'bingoCallCommentaryFlow',
    inputSchema: BingoCallCommentaryInputSchema,
    outputSchema: BingoCallCommentaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

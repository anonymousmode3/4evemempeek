import { MAX_TILES, TILE_COUNT } from "./config";
import { CHOICES } from "../data/choices";
import type { ChoiceId } from "../data/choices";
import type { Question, RankEntry, Round, RoundResult } from "./types";

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function prepareRound(q: Question, prevChoiceOrder?: number[]): Round {
  const answerIndex = CHOICES.findIndex((c) => c.id === q.answer);
  if (answerIndex === -1) {
    throw new Error(`Question "${q.id}": answer "${q.answer}" is not a CHOICES id (src/data/choices.ts)`);
  }
  const tileOrder = shuffle(Array.from({ length: TILE_COUNT }, (_, i) => i));
  return { ...q, answerIndex, tileOrder, choiceOrder: shuffleChoices(prevChoiceOrder) };
}

/** Shuffle the 7 answer buttons, never repeating the previous question's order */
function shuffleChoices(prev?: number[]): number[] {
  const all = CHOICES.map((_, i) => i);
  let order = shuffle(all);
  while (prev && order.every((v, i) => v === prev[i])) order = shuffle(all);
  return order;
}

/** Prepare every round, each with a button order different from the one before */
export function prepareRounds(questions: Question[]): Round[] {
  const rounds: Round[] = [];
  for (const q of questions) rounds.push(prepareRound(q, rounds[rounds.length - 1]?.choiceOrder));
  return rounds;
}

/** 1 tile at 0s, then one more each time another 1/MAX_TILES of the time passes */
export function tilesForElapsed(elapsedMs: number, limitMs: number): number {
  const step = limitMs / MAX_TILES;
  return Math.min(MAX_TILES, 1 + Math.floor(elapsedMs / step));
}

/**
 * A correct answer earns more the fewer tiles were open:
 * weight × (MAX_TILES − tilesShown + 1), so 1 tile = 5×, 5 tiles = 1×.
 * weight is 1, or 5 for a bonus picture.
 */
export function scoreFor(correct: boolean, weight: number, tilesShown: number): number {
  if (!correct) return 0;
  const shown = Math.min(Math.max(tilesShown, 1), MAX_TILES);
  return weight * (MAX_TILES - shown + 1);
}

/** Best possible score for one question (answered with only 1 tile open) */
export function maxScoreFor(weight: number): number {
  return weight * MAX_TILES;
}

/**
 * Rank the 7 favourites by points earned on their pictures (max 15 × MAX_TILES each).
 * Members on the same points share a rank.
 */
export function buildRanking(results: RoundResult[]): RankEntry[] {
  const entries = CHOICES.map((c) => {
    const mine = results.filter((r) => r.answer === c.id);
    return {
      id: c.id as ChoiceId,
      correct: mine.filter((r) => r.correct).length,
      total: mine.length,
      points: mine.reduce((sum, r) => sum + r.points, 0),
      maxPoints: mine.reduce((sum, r) => sum + maxScoreFor(r.weight), 0),
      rank: 0,
    };
  });
  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => {
    const prev = entries[i - 1];
    e.rank = prev && prev.points === e.points ? prev.rank : i + 1;
  });
  return entries;
}

export type Verdict =
  | { kind: "perfect"; favorite: RankEntry }
  | { kind: "match"; favorite: RankEntry }
  | { kind: "other"; favorite: RankEntry; top: RankEntry }
  | { kind: "none"; favorite: RankEntry };

/** Compare the player's favourite with the one they actually know best */
export function verdictFor(ranking: RankEntry[], favoriteId: ChoiceId): Verdict {
  const favorite = ranking.find((e) => e.id === favoriteId)!;
  const top = ranking[0];
  if (top.points === 0) return { kind: "none", favorite };
  // Full marks on every member's pictures
  if (ranking.every((e) => e.points === e.maxPoints)) return { kind: "perfect", favorite };
  // The favourite has the highest score (sharing 1st place counts)
  if (favorite.rank === 1) return { kind: "match", favorite };
  // Someone else scored more than the favourite
  return { kind: "other", favorite, top };
}

import type { ChoiceId } from "../data/choices";

/** One question. Add new ones in src/data/questions.ts */
export interface Question {
  id: string;
  /** Path under /public (e.g. "/images/fuji/1.png") or any image URL */
  image: string;
  /** Which of the 7 favourites this picture is */
  answer: ChoiceId;
  /** Seconds for this question. Falls back to DEFAULT_TIME_LIMIT */
  timeLimit?: number;
  /** Points for a correct answer. Defaults to 1 */
  weight?: number;
}

/** A question ready to play: tile reveal order picked */
export interface Round extends Question {
  answerIndex: number;
  tileOrder: number[];
  /** Display order of the answer buttons: indexes into CHOICES */
  choiceOrder: number[];
}

export interface RoundResult {
  questionId: string;
  answer: ChoiceId;
  correct: boolean;
  timedOut: boolean;
  tilesShown: number;
  /** What this question was worth (1, or 5 for a bonus picture) */
  weight: number;
  points: number;
}

/** How well the player knows one favourite */
export interface RankEntry {
  id: ChoiceId;
  correct: number;
  total: number;
  points: number;
  /** Most points this member's pictures could give */
  maxPoints: number;
  rank: number;
}

export type Phase = "title" | "pick" | "playing" | "reveal" | "result";

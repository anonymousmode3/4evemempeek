import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_TIME_LIMIT, MAX_TILES, REVEAL_MS, SHUFFLE_QUESTIONS, TILE_COUNT } from "../game/config";
import {
  buildRanking,
  prepareRounds,
  scoreFor,
  shuffle,
  tilesForElapsed,
  verdictFor,
  type Verdict,
} from "../game/logic";
import { sfx } from "../game/sound";
import type { ChoiceId } from "../data/choices";
import type { Phase, Question, Round, RoundResult } from "../game/types";

const BEST_KEY = "eate:best";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function useGame(questions: Question[]) {
  const [phase, setPhase] = useState<Phase>("title");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [best, setBest] = useState(readBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const [favorite, setFavorite] = useState<ChoiceId | null>(null);

  const round: Round | undefined = rounds[index];
  const limitMs = (round?.timeLimit ?? DEFAULT_TIME_LIMIT) * 1000;
  const remainingMs = Math.max(0, limitMs - elapsed);
  const tilesShown = tilesForElapsed(elapsed, limitMs);
  const visibleTiles = phase === "playing" ? tilesShown : TILE_COUNT;
  const score = results.reduce((sum, r) => sum + r.points, 0);
  const lastResult = results[results.length - 1];

  // Refs so the timer callback always sees fresh values
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const elapsedRef = useRef(0);

  const resetClock = () => {
    elapsedRef.current = 0;
    setElapsed(0);
  };

  const finishRound = useCallback(
    (choice: number | null) => {
      if (phaseRef.current !== "playing" || !round) return;
      phaseRef.current = "reveal";
      const e = Math.min(elapsedRef.current, limitMs);
      const timedOut = choice === null;
      const correct = choice === round.answerIndex;
      const weight = round.weight ?? 1;
      const shown = tilesForElapsed(e, limitMs);
      const result: RoundResult = {
        questionId: round.id,
        answer: round.answer,
        correct,
        timedOut,
        tilesShown: shown,
        weight,
        points: scoreFor(correct, weight, shown),
      };
      (timedOut ? sfx.timeout : correct ? sfx.correct : sfx.wrong)();
      setPicked(choice);
      setResults((prev) => [...prev, result]);
      setPhase("reveal");
    },
    [round, limitMs],
  );

  // Countdown
  useEffect(() => {
    if (phase !== "playing") return;
    const start = performance.now();
    elapsedRef.current = 0;
    setElapsed(0);
    const id = window.setInterval(() => {
      const e = performance.now() - start;
      elapsedRef.current = e;
      setElapsed(e);
      if (e >= limitMs) finishRound(null);
    }, 50);
    return () => window.clearInterval(id);
  }, [phase, index, limitMs, finishRound]);

  // Beep each time a new tile opens (skip the first)
  const prevTiles = useRef(1);
  useEffect(() => {
    if (phase === "playing" && tilesShown > prevTiles.current) sfx.reveal();
    prevTiles.current = phase === "playing" ? tilesShown : 1;
  }, [phase, tilesShown]);

  const start = useCallback((fav: ChoiceId) => {
    setFavorite(fav);
    const ordered = SHUFFLE_QUESTIONS ? shuffle(questions) : questions;
    setRounds(prepareRounds(ordered));
    setIndex(0);
    resetClock();
    setResults([]);
    setPicked(null);
    setPhase("playing");
    sfx.start();
  }, [questions]);

  const next = useCallback(() => {
    if (index + 1 < rounds.length) {
      setIndex((i) => i + 1);
      resetClock();
      setPicked(null);
      setPhase("playing");
      return;
    }
    const total = results.reduce((sum, r) => sum + r.points, 0);
    setIsNewBest(total > best);
    if (total > best) {
      setBest(total);
      try {
        localStorage.setItem(BEST_KEY, String(total));
      } catch {
        /* storage unavailable */
      }
    }
    setPhase("result");
  }, [index, rounds.length, results, best]);

  // Show the answer for REVEAL_MS, then move on by itself
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (phase !== "reveal") return;
    const id = window.setTimeout(() => nextRef.current(), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [phase, index]);

  /**
   * DEV only: fill fake answers for every question and jump to the result screen.
   * Pass a verdict kind to keep re-rolling until the result screen shows that verdict.
   */
  const devSkipToResult = useCallback(
    (kind?: Verdict["kind"]) => {
      const fav = favorite ?? questions[0].answer;
      const roll = (): RoundResult[] => {
        // Each member gets their own hit rate so rankings vary a lot between rolls
        const rate = new Map<ChoiceId, number>();
        return questions.map((q) => {
          if (!rate.has(q.answer)) rate.set(q.answer, Math.random());
          const correct =
            kind === "none" ? false : kind === "perfect" ? true : Math.random() < rate.get(q.answer)!;
          const weight = q.weight ?? 1;
          // Full marks need every answer on the first tile
          const shown = kind === "perfect" ? 1 : 1 + Math.floor(Math.random() * MAX_TILES);
          return {
            questionId: q.id,
            answer: q.answer,
            correct,
            timedOut: false,
            tilesShown: shown,
            weight,
            points: scoreFor(correct, weight, shown),
          };
        });
      };

      let fake = roll();
      for (let i = 0; kind && i < 5000; i++) {
        if (verdictFor(buildRanking(fake), fav).kind === kind) break;
        fake = roll();
      }
      if (kind && verdictFor(buildRanking(fake), fav).kind !== kind) {
        console.warn(`[dev] could not roll a "${kind}" result with the current questions`);
      }
      setFavorite(fav);
      setResults(fake);
      setIsNewBest(false);
      setPhase("result");
    },
    [questions, favorite],
  );

  return {
    devSkipToResult,
    phase,
    round,
    index,
    total: rounds.length,
    remainingMs,
    limitMs,
    visibleTiles,
    picked,
    results,
    lastResult,
    score,
    best,
    start,
    answer: finishRound,
    isNewBest,
    next,
    favorite,
    toPick: () => setPhase("pick"),
    toTitle: () => setPhase("title"),
  };
}

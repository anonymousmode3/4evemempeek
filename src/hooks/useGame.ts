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

/** Never hold a round longer than this waiting for its picture */
const IMAGE_WAIT_MAX_MS = 3000;

const imageCache = new Map<string, Promise<void>>();

/** Download + decode a picture once; resolves when it can be painted (or failed / took too long) */
function preloadImage(src: string): Promise<void> {
  let p = imageCache.get(src);
  if (!p) {
    const img = new Image();
    img.src = src;
    p = Promise.race([
      img.decode().catch(() => {}),
      new Promise<void>((r) => window.setTimeout(r, IMAGE_WAIT_MAX_MS)),
    ]);
    imageCache.set(src, p);
  }
  return p;
}

export function useGame(questions: Question[]) {
  const [phase, setPhase] = useState<Phase>("title");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
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
  // False until the current round's picture is ready and the clock is running
  const readyRef = useRef(false);

  const resetClock = () => {
    elapsedRef.current = 0;
    setElapsed(0);
  };

  const finishRound = useCallback(
    (choice: number | null) => {
      if (phaseRef.current !== "playing" || !round || !readyRef.current) return;
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

  // Preload the next couple of pictures so they're already cached when their round starts
  useEffect(() => {
    rounds.slice(index + 1, index + 3).forEach((r) => preloadImage(r.image));
  }, [rounds, index]);

  // Countdown — starts only once this round's picture is ready to paint
  const image = round?.image;
  useEffect(() => {
    if (phase !== "playing" || !image) return;
    let cancelled = false;
    let id: number | undefined;
    readyRef.current = false;
    elapsedRef.current = 0;
    setElapsed(0);
    preloadImage(image).then(() => {
      if (cancelled) return;
      readyRef.current = true;
      const start = performance.now();
      id = window.setInterval(() => {
        const e = performance.now() - start;
        elapsedRef.current = e;
        setElapsed(e);
        if (e >= limitMs) finishRound(null);
      }, 50);
    });
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [phase, index, image, limitMs, finishRound]);

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
    setPhase("result");
  }, [index, rounds.length]);

  // Show the answer for REVEAL_MS, then move on by itself
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (phase !== "reveal") return;
    const id = window.setTimeout(() => nextRef.current(), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [phase, index]);

  /**
   * Secret shortcut: fill fake answers for every question and jump to the result screen.
   * Pass a verdict kind to keep re-rolling until the result screen shows that verdict.
   */
  const devSkipToResult = useCallback(
    (kind?: Verdict["kind"], favoriteOverride?: ChoiceId) => {
      const fav = favoriteOverride ?? favorite ?? questions[0].answer;
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
    start,
    answer: finishRound,
    next,
    favorite,
    toPick: () => setPhase("pick"),
    toTitle: () => setPhase("title"),
  };
}

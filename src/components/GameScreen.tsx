import { useEffect } from "react";
import type { ChoiceId } from "../data/choices";
import { MAX_TILES } from "../game/config";
import type { Round, RoundResult } from "../game/types";
import { Choices } from "./Choices";
import { ImageGrid } from "./ImageGrid";
import { TimerBar } from "./TimerBar";

interface Props {
  round: Round;
  index: number;
  total: number;
  score: number;
  remainingMs: number;
  limitMs: number;
  visibleTiles: number;
  picked: number | null;
  revealed: boolean;
  lastResult?: RoundResult;
  favorite: ChoiceId | null;
  onAnswer: (i: number) => void;
  onNext: () => void;
}

export function GameScreen(props: Props) {
  const { round, index, total, score, revealed, lastResult, onAnswer } = props;

  // Keyboard: 1-7 picks the button in that on-screen position
  useEffect(() => {
    if (revealed) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= round.choiceOrder.length)
        onAnswer(round.choiceOrder[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, onAnswer, round.choiceOrder]);

  return (
    <div className="flex flex-1 flex-col gap-5 md:grid md:grid-cols-2 md:content-start md:gap-x-10 md:gap-y-6">
      <header className="flex items-end justify-between md:col-span-2">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-sumi-soft">
            ข้อ {index + 1} จาก {total}
          </span>
          {(round.weight ?? 1) > 1 && (
            <span className="animate-blink bg-yamabuki px-1.5 text-sm font-bold text-sumi">
              โบนัส x{round.weight}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-sumi-soft">คะแนน</span>
          <span className="font-dot text-2xl text-shu tabular-nums">
            {score}
          </span>
        </div>
      </header>

      <div className="md:col-span-2">
        <TimerBar
          remainingMs={revealed ? 0 : props.remainingMs}
          limitMs={props.limitMs}
          tilesShown={Math.min(props.visibleTiles, MAX_TILES)}
          maxTiles={MAX_TILES}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[min(100%,42svh)] md:max-w-none">
        <ImageGrid
          image={round.image}
          tileOrder={round.tileOrder}
          visibleTiles={props.visibleTiles}
          alt={round.answer}
          solved={revealed}
        />
        {revealed && lastResult && <Hanko result={lastResult} />}
      </div>

      <div className="flex flex-col gap-5">
        <Choices
          order={round.choiceOrder}
          answerIndex={round.answerIndex}
          picked={props.picked}
          locked={revealed}
          onPick={onAnswer}
        />
      </div>
    </div>
  );
}

/** Result shown as a hanko stamp pressed onto the picture */
function Hanko({ result }: { result: RoundResult }) {
  const { kanji, thai, color } = result.timedOut
    ? { kanji: "⏱️", thai: "หมดเวลา", color: "text-sumi-soft" }
    : result.correct
      ? { kanji: "✅", thai: "ถูกต้อง", color: "text-shu" }
      : { kanji: "❌️", thai: "ผิด", color: "text-ai" };

  return (
    <div
      className="pointer-events-none absolute -right-2 -bottom-4 z-50 sm:-right-4"
      role="status"
    >
      <div
        className={`hanko animate-stamp bg-kinari px-3 py-2 text-center ${color}`}
      >
        <p className="font-dot text-2xl leading-none">{kanji}</p>
        <p className="mt-1 text-sm font-bold">
          {thai} +{result.points}
        </p>
      </div>
    </div>
  );
}

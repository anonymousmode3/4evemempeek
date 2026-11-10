import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { PickScreen } from "./components/PickScreen";
import { ResultScreen } from "./components/ResultScreen";
import { TitleScreen } from "./components/TitleScreen";
import { questions } from "./data/questions";
import { setMuted } from "./game/sound";
import { useGame } from "./hooks/useGame";

export default function App() {
  const game = useGame(questions);
  const [muted, setMutedState] = useState(false);

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-4 md:max-w-3xl md:px-8 md:py-8">
      <div className="flex justify-end gap-2">
        {(game.phase === "playing" || game.phase === "reveal") && (
          <button type="button" onClick={game.toTitle} className="p-2 text-sm text-sumi-soft">
            ออกจากเกม
          </button>
        )}
        <button
          type="button"
          onClick={toggleMute}
          className="p-2 text-sm text-sumi-soft"
          aria-pressed={muted}
        >
          {muted ? "เสียง: ปิด" : "เสียง: เปิด"}
        </button>
      </div>

      {game.phase === "title" && (
        <TitleScreen
          questionCount={questions.length}
          onStart={game.toPick}
          onSecretResult={game.devSkipToResult}
        />
      )}

      {game.phase === "pick" && (
        <PickScreen
          questionCount={questions.length}
          initial={null}
          onStart={game.start}
          onBack={game.toTitle}
        />
      )}

      {(game.phase === "playing" || game.phase === "reveal") && game.round && (
        <GameScreen
          key={game.round.id}
          round={game.round}
          index={game.index}
          total={game.total}
          score={game.score}
          remainingMs={game.remainingMs}
          limitMs={game.limitMs}
          visibleTiles={game.visibleTiles}
          picked={game.picked}
          revealed={game.phase === "reveal"}
          lastResult={game.lastResult}
          favorite={game.favorite}
          onAnswer={game.answer}
          onNext={game.next}
        />
      )}

      {game.phase === "result" && game.favorite && (
        <ResultScreen
          results={game.results}
          favorite={game.favorite}
          score={game.score}
          onRestart={game.toPick}
          onTitle={game.toTitle}
        />
      )}
    </main>
  );
}

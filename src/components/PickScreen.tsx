import { useState } from "react";
import { CHOICES, type ChoiceId } from "../data/choices";

interface Props {
  questionCount: number;
  initial: ChoiceId | null;
  onStart: (fav: ChoiceId) => void;
  onBack: () => void;
}

/**
 * Centred rows for 7 members, every card spans 2 grid columns:
 * mobile (6 cols)  → 2-3-2  · desktop (8 cols) → 4-3
 */
const PLACEMENT: Record<number, string> = {
  0: "col-start-2 md:col-start-auto", // row 1 of 2-3-2
  4: "md:col-start-2", // row 2 of 4-3
  5: "col-start-2 md:col-start-auto", // row 3 of 2-3-2
};

/** Choose your oshi (推し) — the one you like most — before the quiz */
export function PickScreen({ initial, onStart, onBack }: Props) {
  const [selected, setSelected] = useState<ChoiceId | null>(initial);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="text-center">
        <p className="text-3xl my-4">☀️ 🌻 🦖 🌹 🍌 🐰 🍑</p>
        <p className="mt-2 text-xl font-bold">เมมเบอร์คนนี้แหละ เมนของฉันนน~</p>
        <p className="mt-1 text-sumi-soft">
          <span className="animate-blink">ʚɞ </span>
          เลือก 1 คน แล้วมาดูกันว่าคุณรักจริงมั้ย
          <span className="animate-blink"> ʚɞ</span>
        </p>
      </div>

      <div
        className="grid grid-cols-6 gap-3 px-0.75 md:grid-cols-8"
        role="radiogroup"
      >
        {CHOICES.map((c, i) => {
          const on = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(c.id)}
              className={`px-btn relative col-span-2 block w-full p-1 ${PLACEMENT[i] ?? ""} ${on ? "z-10 bg-sakura!" : ""}`}
            >
              <div className="relative aspect-square w-full overflow-hidden outline-2 outline-sumi">
                <img
                  src={c.avatar}
                  alt=""
                  className={`h-full w-full object-cover object-top transition-transform duration-200 ${on ? "scale-105" : ""}`}
                />
                <span className="absolute inset-x-0 bottom-0 bg-sumi/70 px-1 py-0.5 text-center text-sm font-bold text-kinari sm:text-base">
                  {c.name}
                </span>
              </div>
              {on && (
                <span className="hanko font-dot animate-stamp absolute -top-3 -right-2 z-20 bg-kinari px-1 text-lg leading-tight text-shu">
                  -`♡´-
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-4 pb-2 md:flex-row-reverse">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onStart(selected)}
          className="px-btn bg-shu! flex-1 py-3 text-kinari disabled:opacity-40"
        >
          <span className="text-xl font-bold">▶▶</span>
        </button>
        <button type="button" onClick={onBack} className="px-btn flex-1 py-3">
          <span className="text-xl">◀◀</span>
        </button>
      </div>
    </div>
  );
}

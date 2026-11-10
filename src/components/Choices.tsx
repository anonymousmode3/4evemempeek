import { CHOICES } from "../data/choices";

interface Props {
  /** Display order for this question: indexes into CHOICES */
  order: number[];
  answerIndex: number;
  picked: number | null;
  locked: boolean;
  onPick: (i: number) => void;
}

/**
 * The 7 answers, shuffled per question.
 * 8-column grid, every button spans 2 → rows of 4 and 3, the second row centred.
 */
export function Choices({ order, answerIndex, picked, locked, onPick }: Props) {
  return (
    <div className="grid grid-cols-8 gap-3 px-[3px]">
      {order.map((ci, pos) => {
        const choice = CHOICES[ci];
        let tone = "";
        if (locked && ci === answerIndex) tone = "bg-matcha! text-kinari";
        else if (locked && ci === picked) tone = "bg-shu! text-kinari animate-shake";
        else if (locked) tone = "opacity-45";

        return (
          <button
            key={choice.id}
            type="button"
            disabled={locked}
            onClick={() => onPick(ci)}
            className={`px-btn ${tone} ${pos === 4 ? "col-start-2" : ""} col-span-2 flex min-h-12 flex-col items-center justify-center px-1 py-2 text-center`}
          >
            <span className="text-sm leading-tight font-bold sm:text-base">{choice.name}</span>
          </button>
        );
      })}
    </div>
  );
}

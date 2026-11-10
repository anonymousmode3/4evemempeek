const SEGMENTS = 15;

interface Props {
  remainingMs: number;
  limitMs: number;
  tilesShown: number;
  maxTiles: number;
}

export function TimerBar({ remainingMs, limitMs, tilesShown, maxTiles }: Props) {
  const ratio = remainingMs / limitMs;
  const filled = Math.ceil(ratio * SEGMENTS);
  const color = ratio > 0.66 ? "bg-matcha" : ratio > 0.33 ? "bg-yamabuki" : "bg-shu";
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div className="flex items-center gap-4">
      <div
        className="px-frame flex flex-1 gap-[2px] bg-kinari p-[3px]"
        role="timer"
        aria-label={`เหลือ ${seconds} วินาที`}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div key={i} className={`h-3 flex-1 ${i < filled ? color : "bg-washi"}`} />
        ))}
      </div>
      <span
        className={`font-dot w-7 text-right text-lg tabular-nums ${ratio <= 0.33 ? "text-shu animate-blink" : ""}`}
      >
        {seconds}
      </span>
      <div className="flex gap-1" aria-label={`เปิดป้ายแล้ว ${tilesShown} จาก ${maxTiles}`}>
        {Array.from({ length: maxTiles }, (_, i) => (
          <div
            key={i}
            className={`h-4 w-3 ${i < tilesShown ? "bg-washi outline-2 outline-sumi" : "bg-wood outline-2 outline-wood-dark"}`}
          />
        ))}
      </div>
    </div>
  );
}

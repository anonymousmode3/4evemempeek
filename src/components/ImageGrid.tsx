import { GRID_SIZE, TILE_COUNT } from "../game/config";

const KANJI_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

interface Props {
  image: string;
  tileOrder: number[];
  visibleTiles: number;
  alt: string;
  solved: boolean;
}


/** The picture, covered by 9 wooden fuda plaques that lift away in tileOrder */
export function ImageGrid({ image, tileOrder, visibleTiles, alt, solved }: Props) {
  const open = new Set(tileOrder.slice(0, visibleTiles));

  return (
    <div className="px-frame relative aspect-square w-full bg-sumi">
      <img
        src={image}
        alt={solved ? alt : "ภาพปริศนา"}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        aria-hidden
      >
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <div
            key={i}
            className={`fuda grid place-items-center ${open.has(i) ? "is-open" : ""}`}
          >
            <span className="font-dot text-2xl text-wood-dark sm:text-3xl">{KANJI_NUMBERS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

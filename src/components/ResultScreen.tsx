import type { CSSProperties, ReactNode } from "react";
import { CHOICES, choiceById, type ChoiceId } from "../data/choices";
import {
  buildRanking,
  maxScoreFor,
  verdictFor,
  type Verdict,
} from "../game/logic";
import type { RoundResult } from "../game/types";

interface Props {
  results: RoundResult[];
  favorite: ChoiceId;
  score: number;
  onRestart: () => void;
  onTitle: () => void;
}

export function ResultScreen({
  results,
  favorite,
  score,
  onRestart,
  onTitle,
}: Props) {
  const ranking = buildRanking(results);
  const verdict = verdictFor(ranking, favorite);
  const correct = results.filter((r) => r.correct).length;
  const maxScore = results.reduce((sum, r) => sum + maxScoreFor(r.weight), 0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* {verdict.kind === "perfect" && <div className="mt-0.5" />} */}
      <VerdictCard verdict={verdict} />
      <dl className="flex justify-center gap-10 text-center text-sm text-sumi-soft mt-3">
        <div>
          <dt>ตอบถูกทั้งหมด</dt>
          <dd className="font-dot mt-1 text-2xl text-sumi">
            {correct}/{results.length}
          </dd>
        </div>
        <div>
          <dt>คะแนนรวม</dt>
          <dd className="font-dot mt-1 text-2xl text-shu">
            {score}/{maxScore}
          </dd>
        </div>
      </dl>
      <section aria-label="อันดับความแม่น">
        <p className="text-sumi-soft font-bold text-lg">
          อันดับที่คุณทายแม่นที่สุด
        </p>
        <p className="text-sumi-soft font-bold text-lg mb-4">
          <Tag className="bg-shu text-kinari mr-5">♥ = เมนของฉัน</Tag>
          <Tag className="bg-yamabuki text-sumi">👑 = คะแนนเยอะที่สุด</Tag>
        </p>
        <ol className="px-frame flex flex-col bg-kinari">
          {ranking.map((e) => {
            const c = choiceById(e.id);
            const isFav = e.id === favorite;
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 border-b-2 border-dashed border-wood px-3 py-2 last:border-b-0 ${isFav ? "bg-sakura/40" : ""}`}
              >
                <span
                  className={`text-center font-dot font-bold w-9 shrink-0 text-lg ${e.rank === 1 ? "text-shu" : ""}`}
                >
                  {e.rank}
                </span>
                <img
                  src={c.avatar}
                  alt=""
                  className="h-10 w-10 shrink-0 outline-2 outline-sumi"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-bold">
                    <span className="truncate">{c.name}</span>
                    {isFav && <Tag className="bg-shu text-kinari">♥</Tag>}
                    {e.rank === 1 && e.points > 0 && (
                      <Tag className="bg-yamabuki text-sumi">👑</Tag>
                    )}
                  </p>
                  <div className="mt-1 h-2 bg-washi" aria-hidden>
                    <div
                      className="h-full bg-matcha"
                      style={{
                        width: `${e.maxPoints ? (e.points / e.maxPoints) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-dot w-16 shrink-0 text-right text-lg tabular-nums">
                  {e.points}/{e.maxPoints}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-auto flex flex-col gap-5 pb-2 md:flex-row-reverse">
        <button
          type="button"
          onClick={onRestart}
          className="px-btn bg-shu! flex-1 py-3 text-kinari"
        >
          <span className="text-lg font-bold">เล่นอีกครั้ง</span>
        </button>
        <button type="button" onClick={onTitle} className="px-btn flex-1 py-3">
          <span className="text-base">กลับหน้าแรก</span>
        </button>
      </div>
    </div>
  );
}

function VerdictCard({ verdict }: { verdict: Verdict }) {
  const fav = choiceById(verdict.favorite.id);
  // const f = verdict.favorite;
  // ${fav.name} ${f.points}/${f.maxPoints}

  let kanji: string,
    headline: ReactNode,
    detail: ReactNode,
    image: string,
    color: string,
    accent: string;
  switch (verdict.kind) {
    case "perfect":
      kanji = "PERFECT!";
      headline = "ขอคาราเต้ เอ้ย! คาราวะ!!!";
      detail = (
        <>
          <span className="text-[#EE018F] text-xl">“ </span>
          ตอบถูก ตอบเร็ว ตอบด้วยจิตวิญญาณแห่งฟอร์อายขนาดนี้ เอาไปเลยคำว่า...
          เลิศ, เริ่ด, เริ๊ด, เฬิฏ, เฬิฎ, เฬิศ, เฬิษ, เฬิส, เฬิฐ, เฬิษฐ์,
          เฬิฏฐ์, เฬิธ, เฬิธธิ์, เฬิท, เฬิฑ, เฬิฒ, เฬิจ, เฬิช, เฬิซ, เฬิถ,
          เฬิศศิ์, เฬิสร์, เฬิ๊ฏ, เฬิ๊ฎ, เฬิ๊ศ, เฬิ๊ส, เฬิ๊ฐ, เฬิ๊จ, เฬิ๊ช,
          เฦิศ, เฦิฏ....
          <span className="text-[#EE018F] text-xl"> ”</span>
        </>
      );
      image = fav.avatar;
      color = "text-gold";
      accent = "var(--color-yamabuki)";
      break;
    case "match":
      kanji = "Match!";
      headline = `ฉันก็รักของฉันเข้าใจบ้างมั้ย!!`;
      detail = (
        <>
          <span className="text-[#EE018F] text-xl">“</span> นี่แหละ คนที่มี{" "}
          <span className="font-bold">{fav.name}</span> อยู่เต็มหัวใจ
          เพราะแค่เพียงได้เห็นปลายขนคิ้ว คุณก็พร้อมที่จะกดคำตอบในทันทีทันใดห์
          เอาไปเลย รางวัลแฟนตุวจิงของ{" "}
          <span className="font-bold">{fav.name} 4EVE!</span>{" "}
          <span className="text-[#EE018F] text-xl">”</span>
        </>
      );
      image = fav.avatar;
      color = "text-[#EE018F]";
      accent = "var(--color-shu)";
      break;
    case "other": {
      const top = choiceById(verdict.top.id);
      kanji = "อุ๊ย!!";
      headline = (
        <>
          ดูเหมือนว่า...
          <br />
          คุณจะแม่น {top.name} มากกว่านะ
        </>
      );
      detail = (
        <>
          <span className="text-[#EE018F] text-xl">“ </span>
          <span className="font-bold">{fav.name}</span> ได้หัวใจ ส่วน{" "}
          <span className="font-bold">{top.name}</span> ได้คะแนนนำ เอ๊ะ <br />
          เพราะรูปแหละ หรือเพราะดวงที่แผ่นป้ายเปิด หรือเพราะเลือดกรุ้ปบี
          ไม่ก็ราศีพิจิก แต่ไม่ว่าจะเพราะอะไรก็แล้วแต่...ลองเล่นใหม่ดูมั้ยล่ะ
          แก้มือๆ
          <span className="text-[#EE018F] text-xl"> ”</span>
        </>
      );
      image = top.avatar;
      color = "text-[#EE018F]";
      accent = "var(--color-ai)";
      break;
    }
    case "none":
      kanji = "Ummmm....";
      headline = <>ยังไม่แม่นอันไหนเลย T_T</>;
      detail = (
        <>
          หรือจริงๆ คุณเผลอกดเริ่มเกมทิ้งไว้
          <br />
          แล้วลืมกดคำตอบหรือเปล่านะ?
        </>
      );
      image = fav.avatar;
      color = "text-sumi-soft";
      accent = "var(--color-sumi-soft)";
      break;
  }

  return (
    <div
      className="px-frame-hero animate-pop relative mt-3 mr-2 flex flex-col items-center gap-4 bg-kinari px-3 pt-8 pb-6 text-center"
      style={{ "--accent": accent } as CSSProperties}
      role="status"
    >
      {verdict.kind === "perfect" ? (
        // 4 per row → 4 on top, 3 centered below; each tile is a quarter of the row
        <div className="flex w-full max-w-120 flex-wrap justify-center gap-3 px-1">
          {CHOICES.map((c) => (
            <img
              key={c.id}
              src={c.avatar}
              alt={c.name}
              className="aspect-square w-[calc((100%-2.25rem)/4)] bg-washi object-cover outline-3 outline-sumi"
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute inset-0 translate-x-2 translate-y-2"
            style={{ background: accent }}
            aria-hidden
          />
          <img
            src={image}
            alt=""
            className="relative h-40 w-40 bg-washi object-cover outline-4 outline-sumi sm:h-52 sm:w-52"
          />
        </div>
      )}
      <div className="min-w-0">
        <p
          className={`text-2xl leading-snug font-bold sm:text-3xl ${color === "text-sumi-soft" ? "" : color}`}
        >
          {headline}
        </p>
        <p className="mt-2 text-base text-sumi-soft">{detail}</p>
      </div>
      {verdict.kind === "perfect" ? (
        <PerfectStamp text={kanji} />
      ) : (
        <span
          className={`hanko font-dot animate-stamp absolute -top-5 -left-1 bg-kinari px-2 py-1 text-2xl text-shu`}
          aria-hidden
        >
          {kanji}
        </span>
      )}
    </div>
  );
}

function Tag({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`shrink-0 px-1.5 py-px text-xs font-bold outline-2 outline-sumi ${className}`}
    >
      {children}
    </span>
  );
}

/** 4EVE logos that burst out from the PERFECT stamp: [dx, dy, delay s] */
const SPARKS: [number, number, number][] = [
  [-56, -32, 0],
  [0, -46, 0.3],
  [56, -32, 0.6],
  [84, 4, 0.9],
  [56, 38, 1.2],
  [0, 46, 1.5],
  [-56, 38, 1.8],
  [-84, 4, 2.1],
];

function PerfectStamp({ text }: { text: string }) {
  return (
    // Centered on the card's top edge, with the 4EVE burst around it
    <span
      className="absolute -top-7 left-1/2 z-10 -translate-x-1/2"
      aria-hidden
    >
      {SPARKS.map(([dx, dy, delay], i) => (
        <span
          key={i}
          className="px-spark"
          style={
            {
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animationDelay: `${delay}s`,
            } as CSSProperties
          }
        />
      ))}
      <span className="hanko font-pixel animate-stamp relative block bg-kinari px-2 py-1 text-2xl whitespace-nowrap text-[#EE018F]">
        {text}
      </span>
    </span>
  );
}

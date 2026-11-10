import { useEffect, useRef, useState } from "react";
import type { ChoiceId } from "../data/choices";
import { SECRET_HOLD_MS } from "../game/config";
import type { Verdict } from "../game/logic";
import { SecretPanel } from "./SecretPanel";

interface Props {
  questionCount: number;
  onStart: () => void;
  onSecretResult: (kind: Verdict["kind"] | undefined, favorite: ChoiceId) => void;
}

const DEMO_OPEN = 4; // centre tile

export function TitleScreen({ questionCount, onStart, onSecretResult }: Props) {
  const [showRules, setShowRules] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Holding "เริ่มเกม" for SECRET_HOLD_MS opens the secret panel instead of the rules
  const holdTimer = useRef<number | undefined>(undefined);
  const heldLongEnough = useRef(false);
  const startHold = () => {
    heldLongEnough.current = false;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      heldLongEnough.current = true;
      setShowSecret(true);
    }, SECRET_HOLD_MS);
  };
  const cancelHold = () => window.clearTimeout(holdTimer.current);
  useEffect(() => cancelHold, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      {showSecret && (
        <SecretPanel onPick={onSecretResult} onClose={() => setShowSecret(false)} />
      )}
      {showRules && (
        <RulesModal
          questionCount={questionCount}
          onConfirm={() => {
            setShowRules(false);
            onStart();
          }}
          onCancel={() => setShowRules(false)}
        />
      )}
      <div
        className="px-frame relative h-36 w-36 bg-sumi sm:h-44 sm:w-44"
        aria-hidden
      >
        <div className="absolute inset-0 grid grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className={` ${i === DEMO_OPEN ? " bg-[#EE018F] animate-blink rounded-sm" : "fuda"}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-pixel text-3xl leading-relaxed text-[#eb63b4] sm:text-3xl">
          4EVE
          <br />
          <span className="text-[#625c51]">Member Peek</span>
        </h1>
      </div>

      <p className="max-w-xs text-lg leading-snug text-sumi-soft">
        เมื่อความรักต้องแข่งกับเวลา(ดวง) <br /> คุณคือแฟนตัวจริงของเมนหรือไม่{" "}
        <br />
        ไปลองกันโลด ;P
      </p>

      <button
        type="button"
        onClick={() => {
          // The click that ends a secret long-press shouldn't also open the rules
          if (heldLongEnough.current) {
            heldLongEnough.current = false;
            return;
          }
          setShowRules(true);
        }}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: "none" }}
        className="px-btn bg-[#EE018F] px-10 py-3 text-kinari select-none"
      >
        <span className="text-xl font-bold">เริ่มเกม</span>
      </button>

      <dl className="flex gap-10 text-sm text-shu">
        <dt>
          **เกมนี้เป็นเพียงเกมที่แฟนคลับจัดทำขึ้นเพื่อความบันเทิงเท่านั้น <br />
          ศิลปินหรือค่ายไม่มีส่วนเกี่ยวข้องใดๆ ทั้งสิ้น**
        </dt>
      </dl>
    </div>
  );
}

interface RulesModalProps {
  questionCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function RulesModal({ questionCount, onConfirm, onCancel }: RulesModalProps) {
  // Esc closes the modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const rules = [
    "รูปแบบเกมจะเป็นเกมทายภาพเมมเบอร์ทั้ง 7 คนของ 4EVE โดยภาพจะถูกปิดไว้ด้วยช่อง 3x3",
    `เกมมีทั้งหมด ${questionCount} ข้อ แต่ละข้อมีเวลา 15 วินาที ช่องจะค่อยๆ เปิดทีละช่อง (สูงสุด 5 ช่อง) ยิ่งตอบเร็ว ยิ่งได้คะแนนเยอะ`,
    "ดูภาพแล้วเลือกคำตอบที่ถูกที่สุดจาก 7 ตัวเลือก",
    "เพื่อเพิ่มความตื่นเต้น(และวัดฝีมือ) คุณจะต้องเลือกเมนของคุณ 1 คนก่อนเริ่มเกม",
    `มีข้อยากพิเศษแทรกเข้ามา โดยจะได้คะแนน x5 เมื่อตอบถูก`,
    "ตอบผิดหรือหมดเวลา ได้ 0 คะแนนในข้อนั้นทันที",
    "หวังว่าทุกคนจะสนุกน้า enjoy คับบ!",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sumi/60 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="px-frame w-full max-w-sm bg-kinari p-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rules-title"
          className="mb-4 text-center text-2xl font-bold text-[#EE018F]"
        >
          ⭑.ᐟ กติกุ๊ก ⭑.ᐟ
        </h2>

        <ol className="flex flex-col gap-3">
          {rules.map((rule, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-pixel flex h-7 w-7 shrink-0 items-center justify-center bg-[#EE018F] text-xs text-kinari">
                {i + 1}
              </span>
              <span className="leading-snug">{rule}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="px-btn bg-[#EE018F] py-3 text-kinari"
          >
            <span className="text-lg font-bold">เข้าใจแล้ว เริ่มได้เลย</span>
          </button>
          <button type="button" onClick={onCancel} className="px-btn py-3">
            <span className="text-base">ยกเลิก</span>
          </button>
        </div>
      </div>
    </div>
  );
}

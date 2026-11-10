import { useEffect, useState } from "react";
import { CHOICES, type ChoiceId } from "../data/choices";
import { SECRET_CODE_SHA256 } from "../game/config";
import type { Verdict } from "../game/logic";

const VERDICTS: [Verdict["kind"] | undefined, string][] = [
  [undefined, "สุ่ม"],
  ["perfect", "perfect"],
  ["match", "match"],
  ["other", "other"],
  ["none", "none"],
];

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

interface Props {
  onPick: (kind: Verdict["kind"] | undefined, favorite: ChoiceId) => void;
  onClose: () => void;
}

/** Hidden panel: enter the secret code, then jump straight to a chosen result screen */
export function SecretPanel({ onPick, onClose }: Props) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [favorite, setFavorite] = useState<ChoiceId>(CHOICES[0].id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = (await sha256(code.trim())) === SECRET_CODE_SHA256;
    setUnlocked(ok);
    setError(!ok);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sumi/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="px-frame w-full max-w-sm bg-kinari p-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {!unlocked ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label htmlFor="secret-code" className="font-bold">
              รหัสลับ
            </label>
            <input
              id="secret-code"
              type="password"
              autoFocus
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              className="border-2 border-sumi bg-white px-3 py-2"
            />
            {error && <p className="text-sm text-ai">รหัสไม่ถูกต้อง</p>}
            <div className="flex gap-3">
              <button type="submit" className="px-btn flex-1 bg-[#EE018F] py-2 text-kinari">
                ตกลง
              </button>
              <button type="button" onClick={onClose} className="px-btn flex-1 py-2">
                ยกเลิก
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 font-bold">เมนที่เลือก</p>
              <select
                value={favorite}
                onChange={(e) => setFavorite(e.target.value as ChoiceId)}
                className="w-full border-2 border-sumi bg-white px-3 py-2"
              >
                {CHOICES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-2 font-bold">ไปหน้าผลลัพธ์</p>
              <div className="grid grid-cols-2 gap-2">
                {VERDICTS.map(([kind, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onPick(kind, favorite)}
                    className="px-btn py-2"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-sm text-sumi-soft underline">
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

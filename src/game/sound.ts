// Tiny square-wave beeps via Web Audio — no audio files needed.
let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => { muted = m; };

function beep(freq: number, duration: number, delay = 0) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    // notes below lean on the miyako-bushi scale (E F A B C) for a Japanese flavour
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  start: () => { beep(659, 0.08); beep(880, 0.08, 0.09); beep(1047, 0.14, 0.18); },
  reveal: () => beep(880, 0.05),
  correct: () => { beep(659, 0.08); beep(698, 0.08, 0.09); beep(880, 0.08, 0.18); beep(988, 0.2, 0.27); },
  wrong: () => { beep(220, 0.12); beep(165, 0.2, 0.13); },
  timeout: () => { beep(330, 0.1); beep(247, 0.1, 0.11); beep(196, 0.22, 0.22); },
};

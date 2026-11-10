/**
 * The 7 favourites. They are the answer buttons for EVERY picture (always in this order),
 * and the player picks one of them as "the one I like most" before the game.
 *
 * id      short key used in questions.ts (letters/numbers only)
 * name    shown on buttons and in the summary
 * avatar  picture shown on the pick screen and in the ranking
 */
export const CHOICES = [
  { id: "mind", name: "Mind", avatar: "/images/mind/mind.webp" },
  { id: "jorin", name: "Jorin", avatar: "/images/jorin/jorin.webp" },
  { id: "taaom", name: "Taaom", avatar: "/images/taaom/taaom.webp" },
  { id: "hannah", name: "Hannah", avatar: "/images/hannah/hannah.webp" },
  { id: "fai", name: "Fai", avatar: "/images/fai/fai.webp" },
  { id: "punch", name: "Punch", avatar: "/images/punch/punch.webp" },
  { id: "aheye", name: "Aheye", avatar: "/images/aheye/aheye.webp" },
] as const;

export type Choice = (typeof CHOICES)[number];
export type ChoiceId = Choice["id"];

export const choiceById = (id: ChoiceId): Choice => CHOICES.find((c) => c.id === id)!;

import type { Question } from "../game/types";
import { CHOICES, type ChoiceId } from "./choices";

/**
 * 11 pictures for each of the 7 members = 77 questions.
 *
 * Files live in /public/images/<id>/<id>1.webp … <id>11.webp (e.g. /images/mind/mind1.webp).
 * Pictures 1–10 have weight 1; picture 11 is the bonus picture with weight x5.
 * Points = weight × (tiles left closed + 1), so each member is worth up to 15 × MAX_TILES = 75.
 */
const PHOTOS_PER_MEMBER = 11;
const BONUS_PHOTO = 11;
export const BONUS_WEIGHT = 5;

const photosOf = (answer: ChoiceId): Question[] =>
  Array.from({ length: PHOTOS_PER_MEMBER }, (_, i) => {
    const n = i + 1;
    return {
      id: `${answer}-${n}`,
      image: `/images/${answer}/${answer}${n}.webp`,
      answer,
      weight: n === BONUS_PHOTO ? BONUS_WEIGHT : 1,
    };
  });

export const questions: Question[] = CHOICES.flatMap((c) => photosOf(c.id));

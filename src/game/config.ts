export const GRID_SIZE = 3; // 3x3 = 9 tiles
export const TILE_COUNT = GRID_SIZE * GRID_SIZE;

/** Tiles open over time: 1 at the start, up to this many before time runs out */
export const MAX_TILES = 5;

/** How long the answer stays on screen before the next question starts */
export const REVEAL_MS = 2000;

export const DEFAULT_TIME_LIMIT = 15; // seconds

/** Shuffle the question order each game */
export const SHUFFLE_QUESTIONS = true;

/** Hold the "เริ่มเกม" button this long to open the secret result-shortcut panel */
export const SECRET_HOLD_MS = 10_000;

/**
 * SHA-256 of the secret code.
 * Only the hash ships in the site, so the code itself isn't readable in the JS.
 * To change it:  echo -n "your-code" | shasum -a 256
 */
export const SECRET_CODE_SHA256 =
  "28351392195443a09c606a98d4687252a67138aedd655bae882b84b87d9dff06";

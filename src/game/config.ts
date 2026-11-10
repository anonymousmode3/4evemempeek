export const GRID_SIZE = 3; // 3x3 = 9 tiles
export const TILE_COUNT = GRID_SIZE * GRID_SIZE;

/** Tiles open over time: 1 at the start, up to this many before time runs out */
export const MAX_TILES = 5;

/** How long the answer stays on screen before the next question starts */
export const REVEAL_MS = 2000;

export const DEFAULT_TIME_LIMIT = 15; // seconds

/** Shuffle the question order each game */
export const SHUFFLE_QUESTIONS = true;

/** Show the [dev] result shortcut buttons (only ever shown in `npm run dev`) */
export const SHOW_DEV_SHORTCUTS = true;

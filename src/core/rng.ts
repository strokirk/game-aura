// sfc32: small, fast, seedable. Its whole state lives in the game state, so runs replay exactly.
export type RngState = [number, number, number, number];

export function seedRng(seed: number): RngState {
  const s: RngState = [0x9e3779b9, 0x243f6a88, 0xb7e15162, seed >>> 0];
  for (let i = 0; i < 12; i++) nextRandom(s);
  return s;
}

/** Returns a float in [0, 1) and advances the state in place. */
export function nextRandom(s: RngState): number {
  const t = (((s[0] + s[1]) >>> 0) + s[3]) >>> 0;
  s[3] = (s[3] + 1) >>> 0;
  s[0] = s[1] ^ (s[1] >>> 9);
  s[1] = (s[2] + (s[2] << 3)) >>> 0;
  s[2] = ((s[2] << 21) | (s[2] >>> 11)) >>> 0;
  s[2] = (s[2] + t) >>> 0;
  return t / 4294967296;
}

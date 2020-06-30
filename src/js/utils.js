export const clone = (x) => JSON.parse(JSON.stringify(x));
export const clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper));
export const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));
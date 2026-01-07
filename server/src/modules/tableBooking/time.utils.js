// Small time helpers for HH:mm strings
export function toMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map((s) => parseInt(s, 10));
  return h * 60 + m;
}

export function overlaps(startA, endA, startB, endB) {
  const a0 = toMinutes(startA);
  const a1 = toMinutes(endA);
  const b0 = toMinutes(startB);
  const b1 = toMinutes(endB);
  return a0 < b1 && b0 < a1;
}

export function parseFrameInput(input: string, maxFrames: number): number[] {
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  const out: number[] = [];
  const seen = new Set<number>();
  for (const part of parts) {
    const rangeStep = part.match(/^(\d+)\s*-\s*(\d+)(?:\s*step\s*(\d+))?$/i);
    if (rangeStep) {
      const start = parseInt(rangeStep[1], 10);
      const end = parseInt(rangeStep[2], 10);
      const step = Math.max(1, parseInt(rangeStep[3] || "1", 10));
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let f = lo; f <= hi; f += step) {
        if (!seen.has(f)) { seen.add(f); out.push(f); }
        if (out.length >= maxFrames) return out;
      }
      continue;
    }
    if (/^\d+$/.test(part)) {
      const f = parseInt(part, 10);
      if (!seen.has(f)) { seen.add(f); out.push(f); }
      if (out.length >= maxFrames) return out;
    }
  }
  return out.sort((a, b) => a - b);
}

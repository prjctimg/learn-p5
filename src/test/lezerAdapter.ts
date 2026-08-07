import { parser } from "@lezer/javascript";
import { analyze, type Analysis } from "../utils/editor/validation";

/**
 * Parse `code` with @lezer/javascript and run the validation core's analyzer
 * over it — the same adapter shape check-exercises.mjs uses so test semantics
 * match both the Node-side checks and the exercise WebView bridge.
 */
export function analyzeCode(code: string): Analysis {
  const tree = parser.parse(code);
  return analyze({
    cursor: () => tree.cursor(),
    slice: (from, to) => code.slice(from, to),
  });
}

import { useRef, useState, useCallback } from "react";
import { buildSketchHTML } from "../utils/sketchTemplate";

export function useSketchRunner() {
  const [code, setCode] = useState("");
  const [sourceHTML, setSourceHTML] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const runCounter = useRef(0);

  const run = useCallback((sketchCode: string) => {
    runCounter.current += 1;
    const counter = runCounter.current;

    setIsRunning(true);
    setCode(sketchCode);

    const html = buildSketchHTML(sketchCode);
    setSourceHTML(html);

    setTimeout(() => {
      if (counter === runCounter.current) {
        setIsRunning(false);
      }
    }, 500);
  }, []);

  const stop = useCallback(() => {
    runCounter.current += 1;
    setIsRunning(false);
    setSourceHTML("");
  }, []);

  return { code, setCode, sourceHTML, isRunning, run, stop };
}

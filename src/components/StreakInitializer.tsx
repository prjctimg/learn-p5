import { useEffect } from "react";
import { useStreak } from "../hooks/useStreak";

export default function StreakInitializer() {
  const { checkStreak } = useStreak();

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  return null;
}

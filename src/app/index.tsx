import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!minTimePassed) {
    return <SplashScreen />;
  }

  return <Redirect href="/dashboard" />;
}

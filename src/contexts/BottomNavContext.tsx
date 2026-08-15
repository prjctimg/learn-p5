import React, { createContext, useContext, useState, useCallback } from "react";

interface BottomNavContextValue {
  visible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

const BottomNavContext = createContext<BottomNavContextValue>({
  visible: true,
  show: () => {},
  hide: () => {},
  toggle: () => {},
});

export function BottomNavProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  return (
    <BottomNavContext.Provider value={{ visible, show, hide, toggle }}>
      {children}
    </BottomNavContext.Provider>
  );
}

export function useBottomNavContext() {
  return useContext(BottomNavContext);
}

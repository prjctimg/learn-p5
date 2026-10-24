import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import ContentGate from "../components/ContentGate";
import {
  bootstrapContent,
  checkForContentUpdate,
} from "../content/service";
import type { ContentPack } from "../content/types";

type BootstrapState =
  | { status: "loading"; progress: number }
  | { status: "error"; message: string }
  | { status: "ready"; pack: ContentPack; updatedVersion: string | null };

interface ContentContextValue {
  contentVersion: string;
  p5Version: string;
  refreshing: boolean;
  updatedVersion: string | null;
  dismissUpdate: () => void;
  checkForUpdates: () => Promise<"updated" | "current">;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function messageFor(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Could not download course content.";
}

export default function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BootstrapState>({
    status: "loading",
    progress: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const started = useRef(false);

  const load = useCallback(async () => {
    setState({ status: "loading", progress: 0 });
    try {
      const result = await bootstrapContent((progress) => {
        setState((previous) =>
          previous.status === "loading" ? { ...previous, progress } : previous
        );
      });
      setState({
        status: "ready",
        pack: result.pack,
        updatedVersion: result.updated ? result.pack.contentVersion : null,
      });
    } catch (error) {
      setState({ status: "error", message: messageFor(error) });
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    load();
  }, [load]);

  const checkForUpdates = useCallback(async () => {
    if (state.status !== "ready") return "current";
    setRefreshing(true);
    try {
      const pack = await checkForContentUpdate(state.pack);
      if (!pack) return "current";
      setState({
        status: "ready",
        pack,
        updatedVersion: pack.contentVersion,
      });
      return "updated";
    } finally {
      setRefreshing(false);
    }
  }, [state]);

  if (state.status === "error") {
    return (
      <ContentGate
        status="error"
        error={state.message}
        onRetry={load}
      />
    );
  }

  if (state.status === "loading") {
    return <ContentGate status="loading" progress={state.progress} />;
  }

  return (
    <ContentContext.Provider
      value={{
        contentVersion: state.pack.contentVersion,
        p5Version: state.pack.p5.version,
        refreshing,
        updatedVersion: state.updatedVersion,
        dismissUpdate: () =>
          setState((previous) =>
            previous.status === "ready"
              ? { ...previous, updatedVersion: null }
              : previous
          ),
        checkForUpdates,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used inside ContentProvider.");
  }
  return context;
}

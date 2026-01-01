import { useEffect } from "react";

export const useServerWarmup = (): void => {
  useEffect(() => {
    if (typeof fetch !== "function") return;
    void fetch("/api/health", { method: "GET", cache: "no-store" }).catch(() => undefined);
  }, []);
};

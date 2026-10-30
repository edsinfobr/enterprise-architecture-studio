import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "ea-studio.theme.v1";

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

function systemPrefersDark(): boolean {
  return (
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
}

/**
 * Theme controller supporting three modes:
 *  - "light"  : always light
 *  - "dark"   : always dark
 *  - "system" : follows the OS preference live (reacts to changes)
 *
 * The chosen mode is persisted; the resolved value drives the `dark` class
 * on <html> which Tailwind uses for dark variants.
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => readStored());
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    systemPrefersDark()
  );

  // Listen to OS preference changes (only matters in "system" mode, but we
  // keep systemDark fresh so switching back to system is instant).
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const isDark = mode === "system" ? systemDark : mode === "dark";

  // Apply resolved theme to the document and persist the chosen mode.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  /** Cycle through light -> dark -> system -> light. */
  const cycleMode = useCallback(() => {
    setMode((m) => (m === "light" ? "dark" : m === "dark" ? "system" : "light"));
  }, []);

  return { mode, setMode, cycleMode, isDark };
}

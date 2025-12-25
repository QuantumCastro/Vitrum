import { useEffect, useRef, useState } from "react";

import { Moon, Sun } from "lucide-react";

import type { Copy, Locale } from "../../lib/i18n";
import type { ViewMode } from "./types";

type Props = {
  currentView: ViewMode;
  onLogout: () => void;
  t: Copy;
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function NeuralTopBar({
  currentView,
  onLogout,
  t,
  locale,
  onChangeLocale,
  theme,
  onToggleTheme,
}: Props) {
  const langButtonRef = useRef<HTMLButtonElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const [openLang, setOpenLang] = useState(false);
  const [langMenuPos, setLangMenuPos] = useState<{ top: number; right: number } | null>(null);

  const viewLabel =
    currentView === "graph"
      ? t.nav.universe
      : currentView === "vaults"
        ? t.nav.vaults
        : currentView === "about"
          ? t.nav.about
          : t.nav.editor;

  const themeLabel = theme === "dark" ? t.theme.dark : t.theme.light;

  useEffect(() => {
    if (!openLang) {
      setLangMenuPos(null);
      return;
    }

    const update = () => {
      const rect = langButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top = rect.bottom + 8;
      const right = Math.max(8, window.innerWidth - rect.right);
      setLangMenuPos({ top, right });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [openLang]);

  useEffect(() => {
    if (!openLang) return;

    const handler = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (langMenuRef.current?.contains(target)) return;
      if (langButtonRef.current?.contains(target)) return;
      setOpenLang(false);
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [openLang]);

  return (
    <div className="flex h-16 flex-none items-center justify-between px-6">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="opacity-50">/</span>
          <span className="uppercase tracking-wider">{viewLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
          title={`${t.theme.toggleLabel}: ${themeLabel}`}
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          <span className="hidden md:inline">{themeLabel}</span>
        </button>
        <div className="relative">
          <button
            ref={langButtonRef}
            onClick={() => setOpenLang((prev) => !prev)}
            className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            {locale.toUpperCase()}
          </button>
          {openLang && langMenuPos ? (
            <div
              ref={langMenuRef}
              className="fixed z-[9999] w-36 rounded-xl border border-white/10 bg-slate-900/90 p-1 shadow-xl shadow-black/40 backdrop-blur-xl"
              style={{ top: langMenuPos.top, right: langMenuPos.right }}
            >
              {(["es", "en"] as Locale[]).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    onChangeLocale(code);
                    setOpenLang(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    locale === code
                      ? "bg-violet-500/20 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="font-semibold">{code.toUpperCase()}</span>
                  <span className="text-xs text-slate-400">
                    {code === "es" ? "Español" : "English"}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          {t.nav.logout}
        </button>
      </div>
    </div>
  );
}

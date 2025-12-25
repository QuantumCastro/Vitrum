import { Box, FileText, Info, Network } from "lucide-react";

import type { Copy } from "../../lib/i18n";
import type { ViewMode } from "./types";

type Props = {
  currentView: ViewMode;
  isSidebarOpen: boolean;
  onSetView: (view: ViewMode) => void;
  t: Copy;
};

export function NeuralDock({
  currentView,
  isSidebarOpen,
  onSetView,
  t,
}: Props) {
  return (
    <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-50 flex justify-center px-4 md:px-0">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/70 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl">
        <button
          onClick={() => onSetView("editor")}
          className={`group relative rounded-xl p-3 transition-all duration-300 ${
            currentView === "editor" && !isSidebarOpen
              ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
          title={t.dock.editor}
        >
          <FileText size={20} strokeWidth={2} />
          {currentView === "editor" && !isSidebarOpen ? (
            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_5px_#a78bfa]" />
          ) : null}
        </button>
        <button
          onClick={() => onSetView("graph")}
          className={`group relative rounded-xl p-3 transition-all duration-300 ${
            currentView === "graph"
              ? "bg-fuchsia-500/20 text-fuchsia-300 shadow-[inset_0_0_10px_rgba(217,70,239,0.2)]"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
          title={t.dock.graph}
        >
          <Network size={20} strokeWidth={2} />
          {currentView === "graph" ? (
            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-fuchsia-400 shadow-[0_0_5px_#e879f9]" />
          ) : null}
        </button>
        <button
          onClick={() => onSetView("vaults")}
          className={`group relative rounded-xl p-3 transition-all duration-300 ${
            currentView === "vaults"
              ? "bg-cyan-500/20 text-cyan-300 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
          title={t.dock.vaults}
        >
          <Box size={20} strokeWidth={2} />
          {currentView === "vaults" ? (
            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" />
          ) : null}
        </button>
        <button
          onClick={() => onSetView("about")}
          className={`rounded-xl p-3 transition-all duration-300 ${
            currentView === "about"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
          title={t.dock.about}
        >
          <Info size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

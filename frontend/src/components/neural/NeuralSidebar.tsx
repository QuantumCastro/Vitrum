import { useRef, useState } from "react";

import { Box, FileText, Plus, Search, Upload, X } from "lucide-react";

import type { NoteRead } from "../../api/model";
import type { Copy } from "../../lib/i18n";

type Props = {
  isSidebarOpen: boolean;
  isMobile: boolean;
  activeVaultName?: string;
  notes: NoteRead[];
  activeNoteId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateNote: () => void;
  onImportNotes: (files: FileList) => void;
  onSelectNote: (id: string) => void;
  onCloseMobile: () => void;
  t: Copy;
};

const DEFAULT_DESKTOP_WIDTH = 320;
const MIN_DESKTOP_WIDTH = 240;
const MAX_DESKTOP_WIDTH = 560;

export function NeuralSidebar({
  isSidebarOpen,
  isMobile,
  activeVaultName,
  notes,
  activeNoteId,
  searchQuery,
  onSearchChange,
  onCreateNote,
  onImportNotes,
  onSelectNote,
  onCloseMobile,
  t,
}: Props) {
  const [desktopWidth, setDesktopWidth] = useState<number>(DEFAULT_DESKTOP_WIDTH);
  const isResizingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(DEFAULT_DESKTOP_WIDTH);
  const prevUserSelectRef = useRef<string>("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    event.preventDefault();
    isResizingRef.current = true;
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = desktopWidth;
    prevUserSelectRef.current = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    const delta = event.clientX - resizeStartXRef.current;
    const nextWidth = resizeStartWidthRef.current + delta;
    const clamped = Math.min(MAX_DESKTOP_WIDTH, Math.max(MIN_DESKTOP_WIDTH, nextWidth));
    setDesktopWidth(clamped);
  };

  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.userSelect = prevUserSelectRef.current;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // noop
    }
  };

  const mobileStateClass = isSidebarOpen
    ? "translate-x-0 opacity-100"
    : "-translate-x-full opacity-0 pointer-events-none";
  const positionClass = isMobile
    ? "fixed left-0 top-0 bottom-0 w-[70vw]"
    : "fixed inset-0";

  return (
    <div
      className={`${positionClass} z-40 flex flex-col border-r border-slate-800/50 bg-slate-950/80 backdrop-blur-2xl transition-all duration-500 ease-out md:relative md:inset-auto md:shrink-0 md:bg-slate-900/30 md:shadow-[1px_0_0_rgba(255,255,255,0.03)] md:sticky md:top-0 md:h-screen md:transition-none ${
        isMobile ? mobileStateClass : ""
      }`}
      style={!isMobile ? { width: desktopWidth } : undefined}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2">
            <Box size={12} className="text-violet-400" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t.sidebar.vaultLabel}
            </h2>
          </div>
          <span className="max-w-[150px] truncate text-sm font-bold text-slate-200">
            {activeVaultName ?? t.sidebar.noVault}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCreateNote}
            className="rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-2 text-white shadow-lg shadow-violet-900/20 transition-all hover:scale-105 hover:shadow-violet-500/30"
            disabled={!activeVaultName}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title={t.sidebar.importNotes}
            disabled={!activeVaultName}
          >
            <Upload size={16} strokeWidth={2.5} />
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".md,text/markdown"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.currentTarget.files;
              if (files && files.length > 0) {
                onImportNotes(files);
              }
              event.currentTarget.value = "";
            }}
          />
          {isMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-2 text-slate-400 transition-colors hover:text-white"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="group relative">
          <Search
            className="absolute left-3 top-3 text-slate-500 transition-colors group-focus-within:text-violet-400"
            size={14}
          />
          <input
            type="text"
            placeholder={t.sidebar.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-slate-200 transition-all placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-28 md:pb-6">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300 ${
              activeNoteId === note.id
                ? "border border-slate-700/50 bg-slate-800/60 text-white shadow-md"
                : "border border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
            }`}
          >
            {activeNoteId === note.id ? (
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            ) : null}
            <FileText
              size={15}
              className={
                activeNoteId === note.id
                  ? "text-fuchsia-400"
                  : "opacity-40 transition-opacity group-hover:opacity-70"
              }
            />
            <span
              className={`truncate text-sm font-medium ${note.title ? "" : "italic opacity-50"}`}
            >
              {note.title || t.sidebar.newIdea}
            </span>
          </button>
        ))}
      </div>

      {!isMobile ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className="absolute right-0 top-0 z-50 h-full w-3 cursor-col-resize touch-none"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onDoubleClick={() => setDesktopWidth(DEFAULT_DESKTOP_WIDTH)}
        >
          <div className="mx-auto h-full w-px bg-white/10 transition-colors hover:bg-white/20" />
        </div>
      ) : null}
    </div>
  );
}

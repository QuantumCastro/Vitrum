import { useState } from "react";

import { Network, Sparkles } from "lucide-react";

import type { NoteRead } from "../../api/model";
import { resolveI18nValue, type Copy } from "../../lib/i18n";
import type { ViewMode } from "./types";

type Props = {
  currentView: ViewMode;
  loading: boolean;
  activeNote: NoteRead | null;
  notes: NoteRead[];
  onUpdateNote: (field: "title" | "content" | "links", value: string | string[]) => void;
  onAddLink: (targetId: string) => void;
  onSelectNote: (id: string) => void;
  t: Copy;
};

export function NeuralEditor({
  currentView,
  loading,
  activeNote,
  notes,
  onUpdateNote,
  onAddLink,
  onSelectNote,
  t,
}: Props) {
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const titleValue = resolveI18nValue(activeNote?.title, t);
  const hasTitle = titleValue.length > 0;
  const contentValue = resolveI18nValue(activeNote?.content, t);

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-500 ease-out ${
        currentView === "editor"
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "pointer-events-none translate-y-4 scale-95 opacity-0 blur-sm"
      }`}
    >
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-500">
          {t.editor.loading}
        </div>
      ) : activeNote ? (
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 pb-36 pt-8 md:pb-16">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => onUpdateNote("title", e.target.value)}
              className={`mb-8 w-full bg-transparent text-4xl font-bold focus:outline-none md:text-5xl ${
                hasTitle
                  ? "bg-clip-text text-transparent placeholder:text-slate-800"
                  : "text-slate-300 placeholder:text-slate-500 placeholder:opacity-70"
              }`}
              placeholder={t.editor.titlePlaceholder}
              style={{
                backgroundImage: hasTitle
                  ? "linear-gradient(135deg, var(--title-gradient-start), var(--title-gradient-end))"
                  : undefined,
                caretColor: "var(--text-100)",
              }}
            />
            <textarea
              value={contentValue}
              onChange={(e) => onUpdateNote("content", e.target.value)}
              className="min-h-[50vh] w-full resize-none bg-transparent text-lg font-light leading-8 text-slate-300 placeholder:text-slate-800 focus:outline-none"
              placeholder={t.editor.contentPlaceholder}
            />
            <div className="mt-12 border-t border-slate-800/50 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={12} className="text-fuchsia-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {t.editor.connections}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(activeNote.links ?? []).map((linkId) => {
                  const linked = notes.find((note) => note.id === linkId);
                  if (!linked) return null;
                  return (
                    <button
                      key={linkId}
                      onClick={() => onSelectNote(linkId)}
                      className="rounded-lg border border-violet-500/20 bg-slate-900/50 px-3 py-1.5 text-xs text-violet-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    >
                      [[ {linked.title || t.editor.untitled} ]]
                    </button>
                  );
                })}
                <div className="relative">
                  <button
                    onClick={() => setLinkPickerOpen((prev) => !prev)}
                    className="rounded-lg border border-dashed border-slate-700 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-500 hover:text-slate-300"
                  >
                    {t.editor.addLink}
                  </button>
                  {linkPickerOpen ? (
                    <div className="absolute z-20 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-xl shadow-black/40">
                      <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-slate-500">
                        {t.editor.availableNotes}
                      </p>
                      <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                        {notes
                          .filter(
                            (note) =>
                              note.id !== activeNote.id && !(activeNote.links ?? []).includes(note.id),
                          )
                          .map((note) => (
                            <button
                              key={note.id}
                              onClick={() => {
                                onAddLink(note.id);
                                setLinkPickerOpen(false);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-white/5"
                            >
                              {note.title || t.editor.untitled}
                            </button>
                          ))}
                        {notes.filter(
                          (note) => note.id !== activeNote.id && !(activeNote.links ?? []).includes(note.id),
                        ).length === 0 ? (
                          <p className="px-3 py-2 text-xs text-slate-500">{t.editor.noNotesAvailable}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-600">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
            <Network size={32} className="opacity-20" />
          </div>
          <p>{t.editor.selectNote}</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

import { ArrowRight, Box, Pencil, Plus, Upload, X } from "lucide-react";

import type { VaultWithNotes } from "../../api/model";
import type { Copy } from "../../lib/i18n";
import type { ViewMode } from "./types";

type Props = {
  currentView: ViewMode;
  vaults: VaultWithNotes[];
  activeVaultId: string | null;
  onSelectVault: (vaultId: string) => void;
  onCreateVault: () => void;
  onImportVault: (files: FileList) => void;
  newVaultName: string;
  onChangeNewVaultName: (value: string) => void;
  onRenameVault: (vaultId: string, name: string) => void;
  t: Copy;
};

export function NeuralVaults({
  currentView,
  vaults,
  activeVaultId,
  onSelectVault,
  onCreateVault,
  onImportVault,
  newVaultName,
  onChangeNewVaultName,
  onRenameVault,
  t,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = importInputRef.current;
    if (!input) return;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
  }, []);

  const startEditing = (vaultId: string, name: string) => {
    setEditingId(vaultId);
    setEditingValue(name);
  };

  const saveEditing = (vaultId: string) => {
    onRenameVault(vaultId, editingValue);
    setEditingId(null);
  };

  return (
    <div
      className={`absolute inset-0 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-all duration-500 ${
        currentView === "vaults"
          ? "z-30 translate-y-0 opacity-100"
          : "pointer-events-none z-0 translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:px-10 md:pt-14">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-white">{t.vaults.heading}</h2>
            <p className="text-slate-400">{t.vaults.subtitle}</p>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/30 md:w-auto md:flex-row md:items-center md:gap-3">
            <input
              type="text"
              value={newVaultName}
              onChange={(e) => onChangeNewVaultName(e.target.value)}
              placeholder={t.vaults.inputPlaceholder}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 md:w-64"
            />
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <button
                onClick={onCreateVault}
                className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-white/10 transition-transform hover:scale-105"
              >
                <Plus size={16} /> {t.vaults.create}
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-5 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/5"
                title={t.vaults.importVault}
              >
                <Upload size={16} /> {t.vaults.importVault}
              </button>
              <input
                ref={importInputRef}
                type="file"
                multiple
                accept=".md,text/markdown"
                className="hidden"
                onChange={(event) => {
                  const files = event.currentTarget.files;
                  if (files && files.length > 0) {
                    onImportVault(files);
                  }
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => {
            const isActive = activeVaultId === vault.id;
            const isEditing = editingId === vault.id;
            return (
              <div
                key={vault.id}
                onClick={() => onSelectVault(vault.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all ${
                  isActive
                    ? "border-violet-500/50 bg-slate-900/80 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"
                }`}
              >
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-xl p-3 ${
                      isActive
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <Box size={24} />
                  </div>
                  {isActive ? (
                    <span className="rounded-full bg-violet-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {t.vaults.active}
                    </span>
                  ) : null}
                </div>
                <div className="relative z-10 mb-2 flex items-start justify-between gap-2">
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEditing(vault.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditing(vault.id);
                        }}
                        className="rounded-lg bg-violet-500/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                      >
                        {t.vaults.save}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="rounded-lg border border-slate-700 px-2 py-2 text-xs text-slate-300 transition hover:border-slate-500"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white transition-colors group-hover:text-violet-300">
                        {vault.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(vault.id, vault.name);
                        }}
                        className="flex items-center gap-1 rounded-full border border-slate-800 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition hover:border-violet-500/30 hover:text-violet-300"
                      >
                        <Pencil size={12} /> {t.vaults.edit}
                      </button>
                    </>
                  )}
                </div>
                <p className="relative z-10 mb-6 text-sm text-slate-500">
                  {t.vaults.notes((vault.notes ?? []).length)}
                </p>
                <div className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-violet-400">
                  {t.vaults.open} <ArrowRight size={14} />
                </div>
                <div
                  className={`absolute -bottom-4 -right-4 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 ${
                    isActive
                      ? "bg-violet-500/20 opacity-100"
                      : "bg-slate-700/10 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </div>
            );
          })}
          <div
            onClick={onCreateVault}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-800 text-slate-600 transition-all hover:border-slate-600 hover:bg-slate-900/20 hover:text-slate-400"
          >
            <Plus size={32} />
            <span className="text-sm font-medium">{t.vaults.createEmpty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

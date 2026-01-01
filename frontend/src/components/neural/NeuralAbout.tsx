import { Network } from "lucide-react";

import type { Copy } from "../../lib/i18n";
import type { ViewMode } from "./types";

type Props = {
  currentView: ViewMode;
  onClose: () => void;
  t: Copy;
};

type StackItemProps = {
  title: string;
  body: string;
};

function StackItem({ title, body }: StackItemProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-xs leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

export function NeuralAbout({ currentView, onClose, t }: Props) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center p-6 transition-all duration-300 ${
        currentView === "about"
          ? "z-30 bg-slate-950/60 opacity-100 backdrop-blur-md"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/90 p-8 shadow-2xl shadow-black sm:max-w-lg">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex max-h-[80vh] flex-col">
          <div className="flex-none">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-fuchsia-500/20">
              <Network className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {t.about.headline} <span className="text-fuchsia-500">.pro</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.about.subline}</p>
          </div>

          <div className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-6">
              <section className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {t.about.conceptTitle}
                </p>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-400">
                  {t.about.conceptItems.map((item, index) => (
                    <li key={index} className="flex min-w-0 gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-fuchsia-500/70" />
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {t.about.stackTitle}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <StackItem title={t.about.languagesTitle} body={t.about.languagesBody} />
                  <StackItem title={t.about.frameworksTitle} body={t.about.frameworksBody} />
                  <StackItem title={t.about.librariesTitle} body={t.about.librariesBody} />
                  <StackItem title={t.about.toolsTitle} body={t.about.toolsBody} />
                </div>
              </section>

              <div className="pb-24">
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-950 shadow-lg shadow-white/10 transition-colors hover:bg-slate-200"
                >
                  {t.about.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

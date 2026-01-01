import type { Copy } from "../../lib/i18n";
import type { AuthMode } from "./types";

type Props = {
  mode: AuthMode;
  form: { email: string; password: string; displayName: string };
  setForm: (partial: Partial<{ email: string; password: string; displayName: string }>) => void;
  setMode: (mode: AuthMode) => void;
  onSubmit: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  t: Copy;
};

export function NeuralAuthOverlay({
  mode,
  form,
  setForm,
  setMode,
  onSubmit,
  error,
  isLoading,
  t,
}: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />
      </div>
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t.brand}
            </p>
            <h1 className="text-2xl font-bold text-white">{t.auth.title}</h1>
          </div>
          <div className="flex gap-2 rounded-full bg-white/5 p-1">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                mode === "login" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.auth.login}
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                mode === "register" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.auth.register}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <label className="space-y-2 text-sm text-slate-300">
            <span className="text-xs uppercase tracking-wide text-slate-500">{t.auth.email}</span>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 focus-within:border-violet-400/50">
              <input
                type="email"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                placeholder={t.auth.emailPlaceholder}
                value={form.email}
                onChange={(e) => setForm({ email: e.target.value })}
              />
            </div>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {t.auth.password}
            </span>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 focus-within:border-violet-400/50">
              <input
                type="password"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                placeholder="********"
                value={form.password}
                onChange={(e) => setForm({ password: e.target.value })}
              />
            </div>
          </label>
          {mode === "register" && (
            <label className="space-y-2 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {t.auth.displayName}
              </span>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 focus-within:border-violet-400/50">
                <input
                  type="text"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  placeholder={t.auth.displayNamePlaceholder}
                  value={form.displayName}
                  onChange={(e) => setForm({ displayName: e.target.value })}
                />
              </div>
            </label>
          )}
        </div>
        {error ? <p className="mt-4 text-sm text-fuchsia-300">{error}</p> : null}
        <button
          onClick={() => {
            void onSubmit();
          }}
          disabled={isLoading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? t.auth.processing
            : mode === "login"
              ? t.auth.submitLogin
              : t.auth.submitRegister}
        </button>
      </div>
    </div>
  );
}

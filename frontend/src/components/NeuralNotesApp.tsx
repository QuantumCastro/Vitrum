import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ApiProvider } from "../api/queryClient";
import {
  useLoginApiAuthLoginPost,
  useReadMeApiAuthMeGet,
  useRegisterApiAuthRegisterPost,
} from "../api/generated/auth/auth";
import {
  getListVaultsApiVaultsGetQueryKey,
  useCreateNoteApiVaultsVaultIdNotesPost,
  useCreateVaultApiVaultsPost,
  useListVaultsApiVaultsGet,
  useUpdateNoteApiVaultsVaultIdNotesNoteIdPatch,
  useUpdateVaultApiVaultsVaultIdPatch,
} from "../api/generated/vaults/vaults";
import type { NoteRead, VaultWithNotes } from "../api/model";
import type { Copy, Locale } from "../lib/i18n";
import { detectLocale, resolveI18nValue, translations } from "../lib/i18n";
import { NeuralAbout } from "./neural/NeuralAbout";
import { NeuralAuthOverlay } from "./neural/NeuralAuthOverlay";
import { NeuralDock } from "./neural/NeuralDock";
import { NeuralEditor } from "./neural/NeuralEditor";
import { NeuralGraph } from "./neural/NeuralGraph";
import { NeuralSidebar } from "./neural/NeuralSidebar";
import { NeuralTopBar } from "./neural/NeuralTopBar";
import { NeuralVaults } from "./neural/NeuralVaults";
import type { AuthMode, ViewMode } from "./neural/types";

const getStoredToken = (): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

type WebkitFile = File & { webkitRelativePath?: string };
type LinkIndex = {
  full: Map<string, string>;
  basename: Map<string, string>;
};

function NeuralNotesShell() {
  const [currentView, setCurrentView] = useState<ViewMode>("editor");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "", displayName: "" });
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [newVaultName, setNewVaultName] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [locale, setLocale] = useState<Locale>("es");

  const queryClient = useQueryClient();
  const vaultsKey = getListVaultsApiVaultsGetQueryKey();

  const t: Copy = translations[locale];

  const meQuery = useReadMeApiAuthMeGet({
    query: {
      enabled: Boolean(token),
      retry: false,
    },
  });

  const vaultsQuery = useListVaultsApiVaultsGet({
    query: {
      enabled: Boolean(token),
    },
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const initial = media.matches ? "dark" : "light";
    setTheme(initial);
    const handler = (event: MediaQueryListEvent) => setTheme(event.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (token) {
      window.localStorage.setItem("token", token);
    } else {
      window.localStorage.removeItem("token");
    }
  }, [token]);

  const createVaultMutation = useCreateVaultApiVaultsPost();
  const createNoteMutation = useCreateNoteApiVaultsVaultIdNotesPost();
  const updateNoteMutation = useUpdateNoteApiVaultsVaultIdNotesNoteIdPatch();
  const updateVaultMutation = useUpdateVaultApiVaultsVaultIdPatch();
  const loginMutation = useLoginApiAuthLoginPost();
  const registerMutation = useRegisterApiAuthRegisterPost();

  const vaults = useMemo(() => vaultsQuery.data ?? [], [vaultsQuery.data]);
  const resolvedVaults = useMemo(
    () => vaults.map((vault) => ({ ...vault, name: resolveI18nValue(vault.name, t) })),
    [vaults, t],
  );
  const activeVault = useMemo(
    () => vaults.find((vault) => vault.id === activeVaultId) ?? null,
    [vaults, activeVaultId],
  );
  const displayActiveVault = useMemo(
    () => resolvedVaults.find((vault) => vault.id === activeVaultId) ?? null,
    [resolvedVaults, activeVaultId],
  );
  const notes = useMemo(() => activeVault?.notes ?? [], [activeVault]);
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? null;
  const resolvedNotes = useMemo(
    () => notes.map((note) => ({ ...note, title: resolveI18nValue(note.title, t) })),
    [notes, t],
  );
  const displayActiveNote = useMemo(
    () => resolvedNotes.find((note) => note.id === activeNoteId) ?? null,
    [resolvedNotes, activeNoteId],
  );

  const filteredNotes = useMemo(
    () =>
      resolvedNotes.filter((note) =>
        (note.title ?? "").toLowerCase().includes(searchQuery.toLowerCase().trim()),
      ),
    [resolvedNotes, searchQuery],
  );

  useEffect(() => {
    if (!vaults.length) {
      setActiveVaultId(null);
      setActiveNoteId(null);
      return;
    }

    if (!activeVaultId || !vaults.some((vault) => vault.id === activeVaultId)) {
      const firstVault = vaults[0];
      const firstNotes = firstVault.notes ?? [];
      setActiveVaultId(firstVault.id);
      setActiveNoteId(firstNotes[0]?.id ?? null);
    }
  }, [vaults, activeVaultId]);

  useEffect(() => {
    if (!activeVault) {
      setActiveNoteId(null);
      return;
    }
    const vaultNotes = activeVault.notes ?? [];
    if (!activeNoteId || !vaultNotes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(vaultNotes[0]?.id ?? null);
    }
  }, [activeVault, activeNoteId]);

  const handleLogout = useCallback(() => {
    setToken(null);
    setActiveVaultId(null);
    setActiveNoteId(null);
    setCurrentView("editor");
    setIsSidebarOpen(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (meQuery.error) {
      handleLogout();
    }
  }, [meQuery.error, handleLogout]);

  const updateVaultCache = (updater: (vaults: VaultWithNotes[]) => VaultWithNotes[]) => {
    queryClient.setQueryData(vaultsKey, (current) => {
      if (!current) return current;
      return updater(current as VaultWithNotes[]);
    });
  };

  const updateNoteCache = (noteId: string, vaultId: string, updater: (note: NoteRead) => NoteRead) =>
    updateVaultCache((prev) =>
      prev.map((vault) => {
        if (vault.id !== vaultId) return vault;
        const currentNotes = vault.notes ?? [];
        const updatedNotes = currentNotes.map((note) =>
          note.id === noteId ? updater(note) : note,
        );
        return { ...vault, notes: updatedNotes };
      }),
    );

  const handleAuthSubmit = async () => {
    setAuthError(null);
    const email = authForm.email.trim();
    const password = authForm.password;
    if (!email || !password) {
      setAuthError(t.errors.emptyAuth);
      return;
    }

    try {
      const result =
        authMode === "login"
          ? await loginMutation.mutateAsync({ data: { email, password } })
          : await registerMutation.mutateAsync({
              data: { email, password, display_name: authForm.displayName || undefined },
            });

      setToken(result.access_token);
      setCurrentView("editor");
      setIsSidebarOpen(false);
      await queryClient.invalidateQueries({ queryKey: vaultsKey });
      setAuthForm({ email: "", password: "", displayName: "" });
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (error as Error).message ??
        t.errors.authFailed;
      setAuthError(message);
    }
  };

  const handleCreateVault = () => {
    void (async () => {
      try {
        const name = newVaultName.trim() || t.vaults.defaultName;
        const created = await createVaultMutation.mutateAsync({
          data: { name, theme: "violet" },
        });
        updateVaultCache((prev) => [...prev, created]);
        setActiveVaultId(created.id);
        const createdNotes = created.notes ?? [];
        setActiveNoteId(createdNotes[0]?.id ?? null);
        setCurrentView("vaults");
        setNewVaultName("");
      } catch (error) {
        console.error(t.errors.createVault, error);
      }
    })();
  };

  const handleRenameVault = (vaultId: string, name: string) => {
    void (async () => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const updated = await updateVaultMutation.mutateAsync({
          vaultId,
          data: { name: trimmed },
        });
        updateVaultCache((prev) =>
          prev.map((vault) => (vault.id === vaultId ? { ...vault, ...updated } : vault)),
        );
      } catch (error) {
        console.error(t.errors.renameVault, error);
      }
    })();
  };

  const handleCreateNote = () => {
    if (!activeVaultId) return;
    void (async () => {
      try {
        const created = await createNoteMutation.mutateAsync({
          vaultId: activeVaultId,
          data: { title: "", content: "", links: [] },
        });
        updateVaultCache((prev) =>
          prev.map((vault) => {
            if (vault.id !== activeVaultId) return vault;
            const currentNotes = vault.notes ?? [];
            return { ...vault, notes: [created, ...currentNotes] };
          }),
        );
        setActiveNoteId(created.id);
        setCurrentView("editor");
        if (isMobile) setIsSidebarOpen(false);
      } catch (error) {
        console.error("No se pudo crear la nota", error);
      }
    })();
  };

  const normalizeKey = (value: string) => value.trim().toLowerCase();
  const stripMdExtension = (value: string) => value.replace(/\.md$/i, "");

  const titleFromFilename = (filename: string) => stripMdExtension(filename);

  const titleFromRelativePath = (relativePath: string | undefined, filename: string) => {
    if (!relativePath) return titleFromFilename(filename);
    const normalized = relativePath.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);
    const withoutRoot = segments.length > 1 ? segments.slice(1).join("/") : segments[0] ?? filename;
    return stripMdExtension(withoutRoot);
  };

  const extractWikilinks = (content: string) => {
    const targets: string[] = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let match = regex.exec(content);
    while (match) {
      const raw = match[1]?.trim();
      if (raw) {
        const withoutAlias = raw.split("|")[0]?.trim() ?? raw;
        const withoutHeading = withoutAlias.split("#")[0]?.trim() ?? withoutAlias;
        const cleaned = stripMdExtension(withoutHeading);
        if (cleaned) targets.push(cleaned);
      }
      match = regex.exec(content);
    }
    return targets;
  };

  const buildLinkIndex = (sourceNotes: Array<{ id: string; title?: string | null }>): LinkIndex => {
    const full = new Map<string, string>();
    const basenameCounts = new Map<string, number>();
    const basenameLastId = new Map<string, string>();

    sourceNotes.forEach((note) => {
      const title = resolveI18nValue(note.title, t).trim();
      if (!title) return;
      const key = normalizeKey(title);
      full.set(key, note.id);

      const basename = title.split("/").pop() ?? title;
      const baseKey = normalizeKey(basename);
      basenameCounts.set(baseKey, (basenameCounts.get(baseKey) ?? 0) + 1);
      basenameLastId.set(baseKey, note.id);
    });

    const basename = new Map<string, string>();
    basenameCounts.forEach((count, key) => {
      if (count === 1) {
        const id = basenameLastId.get(key);
        if (id) basename.set(key, id);
      }
    });

    return { full, basename };
  };

  const resolveLinkIdsFromContent = (content: string, currentId: string, index: LinkIndex) => {
    const ids: string[] = [];
    extractWikilinks(content).forEach((target) => {
      const normalized = normalizeKey(target);
      const direct = index.full.get(normalized);
      if (direct) {
        ids.push(direct);
        return;
      }
      const base = target.split("/").pop() ?? target;
      const baseId = index.basename.get(normalizeKey(base));
      if (baseId) ids.push(baseId);
    });
    return Array.from(new Set(ids.filter((id) => id !== currentId)));
  };

  const handleImportNotes = (files: FileList) => {
    if (!activeVaultId) return;
    void (async () => {
      try {
        const markdownFiles = Array.from(files).filter((file) =>
          file.name.toLowerCase().endsWith(".md"),
        );
        if (!markdownFiles.length) return;

        const createdWithContent: Array<{ note: NoteRead; content: string }> = [];
        for (const file of markdownFiles) {
          const content = await file.text();
          const title = titleFromFilename(file.name);
          const created = await createNoteMutation.mutateAsync({
            vaultId: activeVaultId,
            data: { title, content, links: [] },
          });
          createdWithContent.push({ note: created, content });
        }

        const index = buildLinkIndex([...notes, ...createdWithContent.map(({ note }) => note)]);
        for (const { note, content } of createdWithContent) {
          const links = resolveLinkIdsFromContent(content, note.id, index);
          if (!links.length) continue;
          await updateNoteMutation.mutateAsync({
            vaultId: activeVaultId,
            noteId: note.id,
            data: { links },
          });
        }

        await queryClient.invalidateQueries({ queryKey: vaultsKey });
        setActiveNoteId(createdWithContent[0]?.note.id ?? null);
        setCurrentView("editor");
        if (isMobile) setIsSidebarOpen(false);
      } catch (error) {
        console.error("No se pudieron importar las notas", error);
      }
    })();
  };

  const handleImportVault = (files: FileList) => {
    void (async () => {
      try {
        const fileArray = Array.from(files);
        const markdownFiles = fileArray.filter((file) => file.name.toLowerCase().endsWith(".md"));
        if (!markdownFiles.length) return;

        const first = markdownFiles[0] as WebkitFile;
        const relative = first.webkitRelativePath;
        const inferredRoot = relative ? relative.split("/")[0] : titleFromFilename(first.name);
        const baseName = inferredRoot?.trim() || t.vaults.defaultName;

        const suffix = locale === "es" ? " (importado)" : " (imported)";
        let vaultName = baseName;
        if (vaults.some((vault) => vault.name === vaultName)) {
          let counter = 1;
          let candidate = `${vaultName}${suffix}`;
          while (vaults.some((vault) => vault.name === candidate)) {
            counter += 1;
            candidate = `${vaultName}${suffix} ${counter}`;
          }
          vaultName = candidate;
        }

        const createdVault = await createVaultMutation.mutateAsync({
          data: { name: vaultName, theme: "violet" },
        });

        const createdWithContent: Array<{ note: NoteRead; content: string }> = [];
        for (const file of markdownFiles) {
          const webkitFile = file as WebkitFile;
          const content = await file.text();
          const title = titleFromRelativePath(webkitFile.webkitRelativePath, file.name);
          const created = await createNoteMutation.mutateAsync({
            vaultId: createdVault.id,
            data: { title, content, links: [] },
          });
          createdWithContent.push({ note: created, content });
        }

        const index = buildLinkIndex(createdWithContent.map(({ note }) => note));
        for (const { note, content } of createdWithContent) {
          const links = resolveLinkIdsFromContent(content, note.id, index);
          if (!links.length) continue;
          await updateNoteMutation.mutateAsync({
            vaultId: createdVault.id,
            noteId: note.id,
            data: { links },
          });
        }

        await queryClient.invalidateQueries({ queryKey: vaultsKey });
        setActiveVaultId(createdVault.id);
        setActiveNoteId(createdWithContent[0]?.note.id ?? null);
        setCurrentView("editor");
        if (isMobile) setIsSidebarOpen(false);
      } catch (error) {
        console.error("No se pudo importar la bóveda", error);
      }
    })();
  };

  const handleUpdateNote = (field: "title" | "content" | "links", value: string | string[]) => {
    if (!activeVaultId || !activeNoteId) return;
    const data =
      field === "links"
        ? { links: value as string[] }
        : field === "title"
          ? { title: value as string }
          : { content: value as string };

    updateNoteCache(activeNoteId, activeVaultId, (note) => ({ ...note, ...data }));
    updateNoteMutation.mutate(
      { vaultId: activeVaultId, noteId: activeNoteId, data },
      {
        onError: () => {
          void queryClient.invalidateQueries({ queryKey: vaultsKey });
        },
      },
    );
  };

  const handleAddLink = (targetId: string) => {
    if (!activeNote || !activeVaultId) return;
    const currentLinks = activeNote.links ?? [];
    if (currentLinks.includes(targetId)) return;
    const updatedLinks = [...currentLinks, targetId];
    handleUpdateNote("links", updatedLinks);
  };

  const isAuthenticated = Boolean(token);
  const loadingState = meQuery.isLoading || vaultsQuery.isLoading;

  if (!isAuthenticated) {
    return (
      <NeuralAuthOverlay
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={(partial) => setAuthForm((prev) => ({ ...prev, ...partial }))} 
        onSubmit={handleAuthSubmit}
        error={authError}
        isLoading={loginMutation.isPending || registerMutation.isPending}
        t={t}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100 md:flex-row">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-20 h-[50%] w-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-[50%] w-[50%] rounded-full bg-fuchsia-900/20 blur-[120px]" />
      </div>

      <NeuralSidebar
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        activeVaultName={displayActiveVault?.name}
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNote={handleCreateNote}
        onImportNotes={handleImportNotes}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setCurrentView("editor");
          if (isMobile) setIsSidebarOpen(false);
        }}
        onCloseMobile={() => setIsSidebarOpen(false)}
        t={t}
      />

      <div className="relative z-10 flex h-full min-h-screen flex-1 flex-col bg-transparent md:min-h-screen">
        <NeuralTopBar
          currentView={currentView}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          t={t}
          locale={locale}
          onChangeLocale={setLocale}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        />

        <div className="relative flex-1 overflow-hidden">
          <NeuralEditor
            currentView={currentView}
            loading={loadingState}
            activeNote={displayActiveNote}
            notes={resolvedNotes}
            onUpdateNote={handleUpdateNote}
            onAddLink={handleAddLink}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setCurrentView("editor");
            }}
            t={t}
          />

          <div
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              currentView === "graph"
                ? "z-20 scale-100 opacity-100"
                : "pointer-events-none z-0 scale-110 opacity-0"
            }`}
          >
            <NeuralGraph
              notes={resolvedNotes}
              onNodeClick={(id) => {
                setActiveNoteId(id);
                setCurrentView("editor");
              }}
              isActive={currentView === "graph"}
            />
          </div>

          <NeuralVaults
          currentView={currentView}
          vaults={resolvedVaults}
          activeVaultId={activeVaultId}
          newVaultName={newVaultName}
          onSelectVault={(vaultId) => {
            setActiveVaultId(vaultId);
            const selected = vaults.find((vault) => vault.id === vaultId);
            const selectedNotes = selected?.notes ?? [];
            setActiveNoteId(selectedNotes[0]?.id ?? null);
            setCurrentView("editor");
          }}
          onCreateVault={handleCreateVault}
          onImportVault={handleImportVault}
          onChangeNewVaultName={setNewVaultName}
          onRenameVault={handleRenameVault}
          t={t}
        />

          <NeuralAbout currentView={currentView} onClose={() => setCurrentView("editor")} t={t} />
        </div>

        <NeuralDock
          currentView={currentView}
          isSidebarOpen={isSidebarOpen}
          onSetView={setCurrentView}
          t={t}
        />
      </div>
    </div>
  );
}

export default function NeuralNotesApp() {
  return (
    <ApiProvider>
      <NeuralNotesShell />
    </ApiProvider>
  );
}

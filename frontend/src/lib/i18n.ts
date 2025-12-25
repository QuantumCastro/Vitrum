export type Locale = "es" | "en";

export type Copy = {
  brand: string;
  nav: {
    editor: string;
    universe: string;
    vaults: string;
    about: string;
    noVault: string;
    logout: string;
  };
  theme: {
    toggleLabel: string;
    dark: string;
    light: string;
  };
  sidebar: {
    vaultLabel: string;
    noVault: string;
    searchPlaceholder: string;
    newIdea: string;
    importNotes: string;
    toggle: string;
  };
  editor: {
    loading: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    connections: string;
    availableNotes: string;
    addLink: string;
    noNotesAvailable: string;
    untitled: string;
    selectNote: string;
  };
  defaultNotes: {
    welcome: {
      title: string;
      content: string;
    };
    quickstart: {
      title: string;
      content: string;
    };
  };
  defaultVault: {
    name: string;
  };
  vaults: {
    heading: string;
    subtitle: string;
    inputPlaceholder: string;
    create: string;
    importVault: string;
    active: string;
    edit: string;
    save: string;
    cancel: string;
    notes: (count: number) => string;
    open: string;
    createEmpty: string;
    defaultName: string;
  };
  dock: {
    editor: string;
    graph: string;
    vaults: string;
    about: string;
    menu: string;
  };
  auth: {
    title: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    displayName: string;
    displayNamePlaceholder: string;
    login: string;
    register: string;
    submitLogin: string;
    submitRegister: string;
    processing: string;
  };
  about: {
    headline: string;
    subline: string;
    conceptTitle: string;
    conceptItems: string[];
    stackTitle: string;
    languagesTitle: string;
    languagesBody: string;
    frameworksTitle: string;
    frameworksBody: string;
    librariesTitle: string;
    librariesBody: string;
    toolsTitle: string;
    toolsBody: string;
    cta: string;
  };
  errors: {
    emptyAuth: string;
    authFailed: string;
    createVault: string;
    renameVault: string;
  };
};

export const translations: Record<Locale, Copy> = {
  es: {
    brand: "Vitrum",
    nav: {
      editor: "Editor",
      universe: "Universo",
      vaults: "Bóvedas",
      about: "Acerca De",
      noVault: "Sin bóveda",
      logout: "Cerrar sesión",
    },
    theme: {
      toggleLabel: "Tema",
      dark: "Oscuro",
      light: "Claro",
    },
    sidebar: {
      vaultLabel: "Bóveda Actual",
      noVault: "Sin bóveda",
      searchPlaceholder: "Buscar pensamientos...",
      newIdea: "Nueva idea...",
      importNotes: "Importar notas",
      toggle: "Notas",
    },
    editor: {
      loading: "Cargando tu bóveda...",
      titlePlaceholder: "Título...",
      contentPlaceholder: "Empieza a escribir algo brillante...",
      connections: "Conexiones Neuronales",
      availableNotes: "Notas disponibles",
      addLink: "+ Link",
      noNotesAvailable: "No hay notas para enlazar",
      untitled: "Sin título",
      selectNote: "Selecciona una nota para expandir tu mente",
    },
    defaultNotes: {
      welcome: {
        title: "Bienvenido",
        content:
          "Tu boveda empieza aqui. Escribe una nota, enlazala y visualiza el grafo.",
      },
      quickstart: {
        title: "Guia rapida",
        content:
          "Usa el boton de enlaces. Luego abre el grafo para explorar.",
      },
    },
    defaultVault: {
      name: "Boveda inicial",
    },
    vaults: {
      heading: "Tus Bóvedas",
      subtitle: "Contenedores de conocimiento aislados.",
      inputPlaceholder: "Elije Nombre de Bóveda",
      create: "Crear",
      importVault: "Importar bóveda",
      active: "Activa",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      notes: (count: number) => `${count} notas conectadas`,
      open: "Abrir Bóveda",
      createEmpty: "Crear Bóveda Vacía",
      defaultName: "Nueva bóveda",
    },
    dock: {
      editor: "Editor",
      graph: "Grafo Global",
      vaults: "Bóvedas",
      about: "Acerca De",
      menu: "Menú",
    },
    auth: {
      title: "Inicia tu bóveda",
      email: "Email",
      emailPlaceholder: "tu@correo.com",
      password: "Contraseña",
      displayName: "Nombre visible",
      displayNamePlaceholder: "Opcional",
      login: "Login",
      register: "Registro",
      submitLogin: "Entrar",
      submitRegister: "Crear cuenta",
      processing: "Procesando...",
    },
    about: {
      headline: "Vitrum",
      subline: "v1.0 · multi-vault · Markdown + grafo en tiempo real.",
      conceptTitle: "Qué es",
      conceptItems: [
        "Notas en Markdown con login, bóvedas por usuario y enlaces [[wikilink]].",
        "Grafo global en tiempo real para explorar relaciones (inspirado en Obsidian).",
        "Importa vaults y notas desde archivos .md (compatible con carpetas de Obsidian).",
      ],
      stackTitle: "Stack",
      languagesTitle: "Lenguajes",
      languagesBody: "TypeScript (UI) · Python (API).",
      frameworksTitle: "Frameworks",
      frameworksBody: "Astro 5 + React (islands) · FastAPI async.",
      librariesTitle: "Librerías",
      librariesBody:
        "TailwindCSS · TanStack Query + Axios · Orval (OpenAPI) · SQLModel/Alembic · PyJWT + Passlib/bcrypt.",
      toolsTitle: "Tools",
      toolsBody:
        "Vite · ESLint · Prettier · Vitest · pnpm workspaces (pnpm-lock.yaml) · uv (uv.lock) · Ruff · MyPy · Docker Compose · NGINX.",
      cta: "Volver a pensar",
    },
    errors: {
      emptyAuth: "Completa email y contraseña.",
      authFailed: "No se pudo autenticar.",
      createVault: "No se pudo crear la bóveda",
      renameVault: "No se pudo renombrar la bóveda",
    },
  },
  en: {
    brand: "Vitrum",
    nav: {
      editor: "Editor",
      universe: "Universe",
      vaults: "Vaults",
      about: "About",
      noVault: "No vault",
      logout: "Log out",
    },
    theme: {
      toggleLabel: "Theme",
      dark: "Dark",
      light: "Light",
    },
    sidebar: {
      vaultLabel: "Current Vault",
      noVault: "No vault",
      searchPlaceholder: "Search thoughts...",
      newIdea: "New idea...",
      importNotes: "Import notes",
      toggle: "Notes",
    },
    editor: {
      loading: "Loading your vault...",
      titlePlaceholder: "Title...",
      contentPlaceholder: "Start writing something brilliant...",
      connections: "Neural Connections",
      availableNotes: "Available notes",
      addLink: "+ Link",
      noNotesAvailable: "No notes to link",
      untitled: "Untitled",
      selectNote: "Select a note to expand your mind",
    },
    defaultNotes: {
      welcome: {
        title: "Welcome",
        content:
          "Your vault starts here. Write a note, link it, and visualize the graph.",
      },
      quickstart: {
        title: "Quick start",
        content:
          "Use the link button, then open the graph to explore.",
      },
    },
    defaultVault: {
      name: "Starter vault",
    },
    vaults: {
      heading: "Your Vaults",
      subtitle: "Isolated knowledge containers.",
      inputPlaceholder: "Choose Vault Name",
      create: "Create",
      importVault: "Import vault",
      active: "Active",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      notes: (count: number) => `${count} connected notes`,
      open: "Open Vault",
      createEmpty: "Create Empty Vault",
      defaultName: "New vault",
    },
    dock: {
      editor: "Editor",
      graph: "Global Graph",
      vaults: "Vaults",
      about: "About",
      menu: "Menu",
    },
    auth: {
      title: "Start your vault",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      displayName: "Display name",
      displayNamePlaceholder: "Optional",
      login: "Login",
      register: "Register",
      submitLogin: "Sign in",
      submitRegister: "Create account",
      processing: "Processing...",
    },
    about: {
      headline: "Vitrum",
      subline: "v1.0 · multi-vault · Markdown + real-time graph.",
      conceptTitle: "What it is",
      conceptItems: [
        "Markdown notes with login, per-user vaults, and [[wikilink]] connections.",
        "Real-time global graph for exploring relationships (Obsidian-inspired).",
        "Import vaults and notes from .md files (Obsidian folder-friendly).",
      ],
      stackTitle: "Stack",
      languagesTitle: "Languages",
      languagesBody: "TypeScript (UI) · Python (API).",
      frameworksTitle: "Frameworks",
      frameworksBody: "Astro 5 + React (islands) · FastAPI async.",
      librariesTitle: "Libraries",
      librariesBody:
        "TailwindCSS · TanStack Query + Axios · Orval (OpenAPI) · SQLModel/Alembic · PyJWT + Passlib/bcrypt.",
      toolsTitle: "Tools",
      toolsBody:
        "Vite · ESLint · Prettier · Vitest · pnpm workspaces (pnpm-lock.yaml) · uv (uv.lock) · Ruff · MyPy · Docker Compose · NGINX.",
      cta: "Back to thinking",
    },
    errors: {
      emptyAuth: "Please complete email and password.",
      authFailed: "Authentication failed.",
      createVault: "Could not create vault",
      renameVault: "Could not rename vault",
    },
  },
};

const I18N_VALUE_PREFIX = "i18n:";

export const resolveI18nValue = (value: string | null | undefined, t: Copy): string => {
  if (!value) return "";
  if (!value.startsWith(I18N_VALUE_PREFIX)) return value;

  const path = value.slice(I18N_VALUE_PREFIX.length).split(".");
  let current: unknown = t;
  for (const key of path) {
    if (!current || typeof current !== "object") return value;
    const record = current as Record<string, unknown>;
    if (!(key in record)) return value;
    current = record[key];
  }

  return typeof current === "string" ? current : value;
};

export const detectLocale = (): Locale => {
  if (typeof navigator === "undefined") return "es";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("es")) return "es";
  return "es";
};

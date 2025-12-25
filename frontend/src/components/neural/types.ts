import type { NoteRead, VaultWithNotes } from "../../api/model";

export type ViewMode = "editor" | "graph" | "vaults" | "about";
export type AuthMode = "login" | "register";

export type VaultState = VaultWithNotes & { notes: NoteRead[] };

"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  type ParticipantRecord,
  dbClearParticipants,
  dbDeleteParticipant,
  dbGetSetting,
  dbListParticipants,
  dbPutParticipant,
  dbPutSetting,
} from "./db";

export type Participant = {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  createdAt: number;
};

export type CanoeConfig = {
  maxCanoes: number;
  maxPerCanoe: number;
};

type Store = {
  hydrated: boolean;
  participants: Participant[];
  config: CanoeConfig;
  addParticipant: (blob: Blob, name?: string) => Promise<void>;
  renameParticipant: (id: string, name: string) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setConfig: (cfg: Partial<CanoeConfig>) => Promise<void>;
  hydrate: () => Promise<void>;
};

const DEFAULT_CONFIG: CanoeConfig = { maxCanoes: 4, maxPerCanoe: 3 };

function recordToParticipant(r: ParticipantRecord): Participant {
  return {
    id: r.id,
    name: r.name,
    blob: r.blob,
    url: URL.createObjectURL(r.blob),
    createdAt: r.createdAt,
  };
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useKanoStore = create<Store>((set, get) => ({
  hydrated: false,
  participants: [],
  config: DEFAULT_CONFIG,

  hydrate: async () => {
    if (get().hydrated) return;
    const [records, savedConfig] = await Promise.all([
      dbListParticipants(),
      dbGetSetting<CanoeConfig>("config"),
    ]);
    set({
      hydrated: true,
      participants: records.map(recordToParticipant),
      config: savedConfig ?? DEFAULT_CONFIG,
    });
  },

  addParticipant: async (blob, name = "") => {
    const record: ParticipantRecord = {
      id: uid(),
      name,
      blob,
      createdAt: Date.now(),
    };
    await dbPutParticipant(record);
    set((s) => ({ participants: [...s.participants, recordToParticipant(record)] }));
  },

  renameParticipant: async (id, name) => {
    const existing = get().participants.find((p) => p.id === id);
    if (!existing) return;
    await dbPutParticipant({
      id: existing.id,
      name,
      blob: existing.blob,
      createdAt: existing.createdAt,
    });
    set((s) => ({
      participants: s.participants.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  },

  deleteParticipant: async (id) => {
    await dbDeleteParticipant(id);
    const removed = get().participants.find((p) => p.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    set((s) => ({ participants: s.participants.filter((p) => p.id !== id) }));
  },

  clearAll: async () => {
    await dbClearParticipants();
    get().participants.forEach((p) => URL.revokeObjectURL(p.url));
    set({ participants: [] });
  },

  setConfig: async (partial) => {
    const next = { ...get().config, ...partial };
    set({ config: next });
    await dbPutSetting("config", next);
  },
}));

/** Initialiserer store fra IndexedDB ved første client-render. */
export function useHydrateStore() {
  const hydrate = useKanoStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}

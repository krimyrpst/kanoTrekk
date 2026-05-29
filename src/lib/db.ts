import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export type ParticipantRecord = {
  id: string;
  name: string;
  blob: Blob;
  createdAt: number;
};

interface KanoTrekkDB extends DBSchema {
  participants: {
    key: string;
    value: ParticipantRecord;
    indexes: { "by-createdAt": number };
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "kanotrekk";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KanoTrekkDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB er kun tilgjengelig i nettleseren.");
  }
  if (!dbPromise) {
    dbPromise = openDB<KanoTrekkDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("participants")) {
          const store = db.createObjectStore("participants", { keyPath: "id" });
          store.createIndex("by-createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export async function dbListParticipants(): Promise<ParticipantRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("participants", "by-createdAt");
}

export async function dbPutParticipant(p: ParticipantRecord): Promise<void> {
  const db = await getDB();
  await db.put("participants", p);
}

export async function dbDeleteParticipant(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("participants", id);
}

export async function dbClearParticipants(): Promise<void> {
  const db = await getDB();
  await db.clear("participants");
}

export async function dbGetSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const row = await db.get("settings", key);
  return row?.value as T | undefined;
}

export async function dbPutSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}

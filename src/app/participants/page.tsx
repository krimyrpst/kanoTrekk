"use client";

import Link from "next/link";
import { useState } from "react";
import { CameraButton } from "@/components/CameraButton";
import { ParticipantCard } from "@/components/ParticipantCard";
import { useHydrateStore, useKanoStore } from "@/lib/store";

export default function ParticipantsPage() {
  useHydrateStore();
  const participants = useKanoStore((s) => s.participants);
  const addParticipant = useKanoStore((s) => s.addParticipant);
  const renameParticipant = useKanoStore((s) => s.renameParticipant);
  const deleteParticipant = useKanoStore((s) => s.deleteParticipant);
  const clearAll = useKanoStore((s) => s.clearAll);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const sorted = participants.slice().sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-6 pb-32">
      <header className="flex items-center justify-between pt-2">
        <Link href="/" className="text-water-200 hover:text-water-50">
          ← Tilbake
        </Link>
        <h1 className="text-xl font-semibold">Deltakere</h1>
        <span className="text-sm text-water-300/80">{sorted.length}</span>
      </header>

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-water-800/40 p-8 text-center text-water-200">
          <p className="mb-2 text-base">Ingen deltakere ennå.</p>
          <p className="text-sm text-water-300/70">
            Trykk &laquo;Ta bilde&raquo; nederst for å legge til den første.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              onRename={renameParticipant}
              onDelete={deleteParticipant}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex justify-center">
          {confirmingClear ? (
            <div className="flex gap-2 text-sm">
              <button
                onClick={async () => {
                  await clearAll();
                  setConfirmingClear(false);
                }}
                className="rounded-lg bg-red-600/80 px-3 py-2 font-medium text-white"
              >
                Bekreft sletting
              </button>
              <button
                onClick={() => setConfirmingClear(false)}
                className="rounded-lg bg-water-700/60 px-3 py-2 text-water-100"
              >
                Avbryt
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingClear(true)}
              className="text-xs text-water-300/70 underline underline-offset-4"
            >
              Slett alle deltakere
            </button>
          )}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-water-800/60 bg-ink/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <CameraButton
            className="flex-1"
            label="Ta bilde av neste deltaker"
            onCapture={(blob) => addParticipant(blob)}
          />
          <Link
            href="/draw"
            aria-disabled={sorted.length < 2}
            className={`flex-1 rounded-2xl py-4 text-center text-lg font-semibold transition ${
              sorted.length >= 2
                ? "bg-water-500 text-ink shadow-lg shadow-water-500/30"
                : "pointer-events-none bg-water-700/40 text-water-300/60"
            }`}
          >
            Trekk! →
          </Link>
        </div>
      </div>
    </div>
  );
}

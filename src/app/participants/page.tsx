"use client";

import Link from "next/link";
import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { LiveCamera } from "@/components/LiveCamera";
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
  const [cameraOpen, setCameraOpen] = useState(false);

  const sorted = participants.slice().sort((a, b) => a.createdAt - b.createdAt);
  const canDraw = sorted.length >= 2;

  return (
    <div className="space-y-6 pb-28">
      <header className="flex items-center justify-between pt-2">
        <Link href="/" className="text-water-200 hover:text-water-50">
          ← Tilbake
        </Link>
        <h1 className="text-xl font-semibold">Deltakere</h1>
        <span className="text-sm text-water-300/80">{sorted.length}</span>
      </header>

      <section className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <DropZone onAdd={(blob) => addParticipant(blob)} />
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-water-500/90 px-6 py-4 font-semibold text-ink shadow-lg shadow-water-500/30 transition active:scale-[0.98] sm:flex-col sm:px-8 sm:py-5"
        >
          <span className="text-2xl sm:text-3xl" aria-hidden>
            📷
          </span>
          <span>Åpne kamera</span>
        </button>
      </section>

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-water-800/40 p-6 text-center text-water-200">
          <p className="text-sm text-water-300/70">
            Drop bilder fra PC, eller åpne kameraet på telefonen for å ta bilder direkte.
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
        <div className="mx-auto max-w-3xl">
          <Link
            href="/draw"
            aria-disabled={!canDraw}
            className={`block w-full rounded-2xl py-4 text-center text-lg font-semibold transition ${
              canDraw
                ? "bg-sun text-ink shadow-lg shadow-sun/20"
                : "pointer-events-none bg-water-700/40 text-water-300/60"
            }`}
          >
            {canDraw ? `Trekk! (${sorted.length} deltakere) →` : "Trenger minst 2 deltakere"}
          </Link>
        </div>
      </div>

      <LiveCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(blob) => addParticipant(blob)}
      />
    </div>
  );
}

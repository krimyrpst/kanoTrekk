"use client";

import { useState } from "react";
import type { Participant } from "@/lib/store";

type Props = {
  participant: Participant;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function ParticipantCard({ participant, onRename, onDelete }: Props) {
  const [name, setName] = useState(participant.name);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-water-800/60 ring-1 ring-water-700/40">
      <img
        src={participant.url}
        alt={participant.name || "Deltaker"}
        className="aspect-square w-full object-cover"
      />
      <div className="p-2">
        <input
          type="text"
          value={name}
          placeholder="Navn (valgfritt)"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== participant.name) onRename(participant.id, name);
          }}
          className="w-full rounded-lg bg-water-900/60 px-2 py-1.5 text-sm text-water-50 placeholder:text-water-300/50 focus:outline-none focus:ring-2 focus:ring-sun"
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(participant.id)}
        aria-label="Fjern deltaker"
        className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-xs text-water-100 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

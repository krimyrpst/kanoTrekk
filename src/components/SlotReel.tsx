"use client";

import { useMemo } from "react";
import type { Participant } from "@/lib/store";

type Props = {
  pool: Participant[];
  winner: Participant;
  delayMs: number;
  durationMs: number;
  cycles?: number;
};

const CELL_PX = 96;

/**
 * Vertikalt rullende reel som lander på `winner`. Strip-en består av
 * `cycles` runder med tilfeldig miksede deltakere etterfulgt av winneren,
 * og animeres med CSS keyframes (se globals.css).
 */
export function SlotReel({ pool, winner, delayMs, durationMs, cycles = 4 }: Props) {
  const strip = useMemo(() => {
    const items: Participant[] = [];
    for (let i = 0; i < cycles; i++) {
      const shuffled = pool.slice().sort(() => Math.random() - 0.5);
      items.push(...shuffled);
    }
    items.push(winner);
    return items;
  }, [pool, winner, cycles]);

  // Slutt-translateY: alle elementer untatt det siste forskyves opp.
  const endOffset = -CELL_PX * (strip.length - 1);

  return (
    <div
      className="relative h-24 w-24 overflow-hidden rounded-2xl bg-ink/70 ring-1 ring-water-700/40"
      style={{ width: CELL_PX, height: CELL_PX }}
    >
      <div
        className="reel-track flex flex-col"
        style={
          {
            "--reel-end": `${endOffset}px`,
            "--reel-duration": `${durationMs}ms`,
            "--reel-delay": `${delayMs}ms`,
          } as React.CSSProperties
        }
      >
        {strip.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex shrink-0 items-center justify-center"
            style={{ width: CELL_PX, height: CELL_PX }}
          >
            <img
              src={p.url}
              alt={p.name || ""}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

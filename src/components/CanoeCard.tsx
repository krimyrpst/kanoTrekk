"use client";

import { motion } from "framer-motion";
import { SlotReel } from "./SlotReel";
import type { Participant } from "@/lib/store";

type Props = {
  index: number;
  members: Participant[];
  pool: Participant[];
  spinning: boolean;
  baseDelayMs: number;
};

export function CanoeCard({ index, members, pool, spinning, baseDelayMs }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="rounded-3xl bg-water-800/50 p-4 ring-1 ring-water-700/40"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-water-50">Kano {index + 1}</h3>
        <span className="text-xs uppercase tracking-wide text-water-300/70">
          {members.length} {members.length === 1 ? "person" : "personer"}
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {members.map((m, slotIdx) => (
          <div key={m.id} className="flex flex-col items-center gap-1.5">
            {spinning ? (
              <SlotReel
                pool={pool}
                winner={m}
                delayMs={baseDelayMs + slotIdx * 140}
                durationMs={2200 + slotIdx * 220}
              />
            ) : (
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-ink/70 ring-1 ring-water-700/40">
                <img src={m.url} alt={m.name || ""} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="max-w-[6rem] truncate text-xs text-water-200">{m.name || "—"}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

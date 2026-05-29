"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CanoeCard } from "@/components/CanoeCard";
import { distribute, type Distribution } from "@/lib/distribute";
import { useHydrateStore, useKanoStore, type Participant } from "@/lib/store";

const SPIN_TOTAL_MS = 3400;

export default function DrawPage() {
  useHydrateStore();
  const participants = useKanoStore((s) => s.participants);
  const config = useKanoStore((s) => s.config);
  const hydrated = useKanoStore((s) => s.hydrated);

  const [drawNonce, setDrawNonce] = useState(0);
  const [spinning, setSpinning] = useState(true);

  const result = useMemo<Distribution<Participant> | null>(() => {
    if (!hydrated) return null;
    return distribute({
      participants,
      maxCanoes: config.maxCanoes,
      maxPerCanoe: config.maxPerCanoe,
    });
    // drawNonce er en bevisst del av deps for å trigge ny shuffle ved retrekk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, config, hydrated, drawNonce]);

  useEffect(() => {
    setSpinning(true);
    const t = setTimeout(() => setSpinning(false), SPIN_TOTAL_MS);
    return () => clearTimeout(t);
  }, [drawNonce, result]);

  if (!hydrated) {
    return <p className="pt-10 text-center text-water-200">Laster…</p>;
  }

  if (!result || !result.ok) {
    return (
      <div className="space-y-4 pt-6">
        <Link href="/participants" className="text-water-200 hover:text-water-50">
          ← Tilbake til deltakere
        </Link>
        <div className="rounded-2xl bg-red-500/15 p-6 text-center text-red-100">
          <p className="text-base font-medium">Kan ikke trekke ennå</p>
          <p className="mt-2 text-sm text-red-200/90">{result?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex items-center justify-between pt-2">
        <Link href="/participants" className="text-water-200 hover:text-water-50">
          ← Deltakere
        </Link>
        <h1 className="text-xl font-semibold">Trekning</h1>
        <span className="text-sm text-water-300/80">
          {result.usedCanoes} kano{result.usedCanoes === 1 ? "" : "er"}
        </span>
      </header>

      {result.unusedCanoes > 0 && (
        <p className="rounded-xl bg-water-800/50 px-4 py-2 text-center text-sm text-water-200">
          {result.unusedCanoes} kano{result.unusedCanoes === 1 ? "" : "er"} brukes ikke for å holde
          minst 2 i hver.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {result.canoes.map((members, i) => (
          <CanoeCard
            key={`${drawNonce}-${i}`}
            index={i}
            members={members}
            pool={participants}
            spinning={spinning}
            baseDelayMs={i * 220}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setDrawNonce((n) => n + 1)}
          disabled={spinning}
          className="flex-1 rounded-2xl bg-sun py-4 text-lg font-semibold text-ink shadow-lg shadow-sun/20 transition active:scale-[0.98] disabled:opacity-60"
        >
          {spinning ? "Trekker…" : "Trekk på nytt"}
        </button>
        <Link
          href="/participants"
          className="flex-1 rounded-2xl border border-water-400/40 py-4 text-center text-base font-medium text-water-100"
        >
          Endre deltakere
        </Link>
      </div>
    </div>
  );
}

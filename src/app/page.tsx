"use client";

import Link from "next/link";
import { CanoeConfigForm } from "@/components/CanoeConfigForm";
import { useHydrateStore, useKanoStore } from "@/lib/store";

export default function HomePage() {
  useHydrateStore();
  const config = useKanoStore((s) => s.config);
  const setConfig = useKanoStore((s) => s.setConfig);
  const participantCount = useKanoStore((s) => s.participants.length);
  const hydrated = useKanoStore((s) => s.hydrated);

  return (
    <div className="space-y-8">
      <header className="space-y-2 pt-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-water-50 sm:text-5xl">
          kano<span className="text-sun">Trekk</span>
        </h1>
        <p className="text-water-200/80">
          Trekk en rettferdig fordeling av deltakere til kanoer.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-water-300/80">
          Kanokonfigurasjon
        </h2>
        <CanoeConfigForm config={config} onChange={setConfig} />
      </section>

      <section className="space-y-3">
        <Link
          href="/participants"
          className="block w-full rounded-2xl bg-sun py-4 text-center text-lg font-semibold text-ink shadow-lg shadow-sun/20"
        >
          {participantCount > 0
            ? `Fortsett (${participantCount} deltaker${participantCount === 1 ? "" : "e"})`
            : "Legg til deltakere"}
        </Link>
        {hydrated && participantCount >= 2 && (
          <Link
            href="/draw"
            className="block w-full rounded-2xl border border-water-400/40 py-3 text-center text-base font-medium text-water-100"
          >
            Hopp rett til trekning
          </Link>
        )}
      </section>

      <footer className="pt-6 text-center text-xs text-water-300/60">
        Bilder lagres kun lokalt i nettleseren din.
      </footer>
    </div>
  );
}

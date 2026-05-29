"use client";

import type { CanoeConfig } from "@/lib/store";

type Props = {
  config: CanoeConfig;
  onChange: (cfg: Partial<CanoeConfig>) => void;
};

export function CanoeConfigForm({ config, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <NumberField
        label="Antall kanoer"
        hint="Hvor mange kanoer er tilgjengelig"
        value={config.maxCanoes}
        min={1}
        max={30}
        onChange={(v) => onChange({ maxCanoes: v })}
      />
      <NumberField
        label="Maks per kano"
        hint="Maksimalt antall personer i hver kano"
        value={config.maxPerCanoe}
        min={2}
        max={6}
        onChange={(v) => onChange({ maxPerCanoe: v })}
      />
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <label className="block rounded-2xl bg-water-800/60 p-4 ring-1 ring-water-700/40">
      <span className="text-sm font-medium text-water-100">{label}</span>
      <p className="mt-0.5 text-xs text-water-300/80">{hint}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          className="h-10 w-10 rounded-lg bg-water-700/60 text-xl font-bold text-water-50 active:scale-95"
          aria-label={`Reduser ${label}`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || min))}
          className="h-10 w-full rounded-lg bg-water-900/60 text-center text-xl font-semibold text-water-50 focus:outline-none focus:ring-2 focus:ring-sun"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          className="h-10 w-10 rounded-lg bg-water-700/60 text-xl font-bold text-water-50 active:scale-95"
          aria-label={`Øk ${label}`}
        >
          +
        </button>
      </div>
    </label>
  );
}

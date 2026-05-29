"use client";

import { useRef, useState } from "react";
import { fileToResizedBlob } from "@/lib/image";

type Props = {
  onCapture: (blob: Blob) => Promise<void> | void;
  label?: string;
  className?: string;
};

export function CameraButton({ onCapture, label = "Ta bilde", className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const blob = await fileToResizedBlob(file);
      await onCapture(blob);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ukjent feil ved bildebehandling.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full rounded-2xl bg-sun px-6 py-4 text-lg font-semibold text-ink shadow-lg shadow-sun/20 transition active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Behandler..." : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {error && (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}

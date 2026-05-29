"use client";

import { useRef, useState } from "react";
import { fileToResizedBlob } from "@/lib/image";

type Props = {
  onAdd: (blob: Blob) => Promise<void> | void;
  className?: string;
};

export function DropZone({ onAdd, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Bare bildefiler godtas.");
      return;
    }
    setBusy(true);
    setError(null);
    const failed: string[] = [];
    for (const file of files) {
      try {
        const blob = await fileToResizedBlob(file);
        await onAdd(blob);
      } catch {
        failed.push(file.name);
      }
    }
    if (failed.length > 0) {
      setError(`Klarte ikke lese: ${failed.join(", ")}`);
    }
    setBusy(false);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!hover) setHover(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setHover(false);
      }}
      onDrop={async (e) => {
        e.preventDefault();
        setHover(false);
        await handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`cursor-pointer select-none rounded-2xl border-2 border-dashed p-6 text-center transition ${
        hover
          ? "border-sun bg-sun/10"
          : "border-water-500/40 bg-water-800/30 hover:border-water-400/70 hover:bg-water-800/50"
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          await handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="pointer-events-none space-y-1">
        <p className="text-base font-medium text-water-50">
          {busy ? "Behandler bilder…" : "Slipp bilder her, eller trykk for å velge"}
        </p>
        <p className="text-xs text-water-300/70">JPEG, PNG eller WebP — flere om gangen</p>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}

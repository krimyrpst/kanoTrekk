"use client";

import { useEffect, useRef, useState } from "react";
import { videoFrameToBlob } from "@/lib/image";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => Promise<void> | void;
};

type Facing = "user" | "environment";

export function LiveCamera({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (!open) {
      setAdded(0);
      return;
    }
    let cancelled = false;
    setError(null);
    setReady(false);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Nettleseren støtter ikke direktekamera.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        const msg =
          name === "NotAllowedError"
            ? "Kameratilgang ble avvist. Tillat kamera i nettleserinnstillingene."
            : name === "NotFoundError"
              ? "Fant ikke noe kamera på denne enheten."
              : err instanceof Error
                ? err.message
                : "Kunne ikke åpne kameraet.";
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facing]);

  const handleCapture = async () => {
    if (!videoRef.current || busy || !ready) return;
    setBusy(true);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    try {
      const blob = await videoFrameToBlob(videoRef.current);
      await onCapture(blob);
      setAdded((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klarte ikke ta bilde.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur">
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-water-800/70 px-3 py-2 text-sm font-medium text-water-100"
        >
          ← Lukk
        </button>
        <div className="text-center text-sm text-water-200">
          {added > 0 ? (
            <span>
              {added} bilde{added === 1 ? "" : "r"} lagt til
            </span>
          ) : (
            <span>Trykk på den gule knappen for å ta bilde</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          disabled={!ready}
          className="rounded-lg bg-water-800/70 px-3 py-2 text-sm font-medium text-water-100 disabled:opacity-50"
          aria-label="Bytt kamera"
          title="Bytt mellom front- og bakkamera"
        >
          ⇄
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-black">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="max-w-md rounded-2xl bg-red-500/15 p-5 text-center text-red-100">
              {error}
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-contain"
              onLoadedMetadata={() => setReady(true)}
            />
            {flash && (
              <div className="pointer-events-none absolute inset-0 bg-white/70 transition-opacity" />
            )}
          </>
        )}
      </div>

      <div className="flex justify-center p-6">
        <button
          type="button"
          onClick={handleCapture}
          disabled={busy || !!error || !ready}
          aria-label="Ta bilde"
          className="h-20 w-20 rounded-full bg-sun ring-4 ring-sun/40 ring-offset-2 ring-offset-ink transition active:scale-95 disabled:opacity-50"
        />
      </div>
    </div>
  );
}

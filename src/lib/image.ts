const MAX_WIDTH = 480;
const JPEG_QUALITY = 0.82;

/**
 * Laster et bilde fra File og skalerer det ned til maks bredde via canvas.
 * Returnerer en Blob (JPEG). Kaster hvis nettleseren ikke kan dekode (typisk HEIC
 * på eldre iOS) — kallsite skal vise vennlig feilmelding.
 */
export async function fileToResizedBlob(file: File): Promise<Blob> {
  const source = await loadFromFile(file);
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  return drawToJpegBlob(source, w, h);
}

/**
 * Henter ut nåværende frame fra et live <video>-element (getUserMedia) og
 * skalerer ned til samme maks-bredde som file-import.
 */
export async function videoFrameToBlob(video: HTMLVideoElement): Promise<Blob> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) throw new Error("Kameraet er ikke klart ennå.");
  return drawToJpegBlob(video, w, h);
}

async function drawToJpegBlob(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
): Promise<Blob> {
  const scale = Math.min(1, MAX_WIDTH / srcW);
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kunne ikke initialisere canvas.");
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Kunne ikke konvertere bilde."));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function loadFromFile(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Faller tilbake til <img>-route, typisk for HEIC.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Bildeformatet støttes ikke på denne enheten."));
      el.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

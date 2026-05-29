const MAX_WIDTH = 480;
const JPEG_QUALITY = 0.82;

/**
 * Laster et bilde fra File og skalerer det ned til maks bredde via canvas.
 * Returnerer en Blob (JPEG). Kaster hvis nettleseren ikke kan dekode (typisk HEIC
 * på eldre iOS) — kall site skal vise vennlig feilmelding.
 */
export async function fileToResizedBlob(file: File): Promise<Blob> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kunne ikke initialisere canvas.");
  ctx.drawImage(bitmap, 0, 0, width, height);

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

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Faller tilbake til <img>-route, typisk for HEIC.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Bildeformatet støttes ikke på denne enheten."));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

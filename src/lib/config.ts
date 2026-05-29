/**
 * BASE_PATH brukes for å prefikse statiske eiendeler vi refererer direkte
 * (manifest, ikoner). Next.js prefikser automatisk for <Link> og dynamic imports
 * når basePath er satt i next.config.js, men metadata-felt og hardkodede paths
 * må vi prefikse selv.
 *
 * Bygges fra samme env-var som next.config.js for å holde dem i synk.
 */
export const BASE_PATH =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_PATH ?? "/kanoTrekk"
    : "";

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}

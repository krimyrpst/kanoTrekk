export type DistributionInput<T> = {
  participants: readonly T[];
  maxCanoes: number;
  maxPerCanoe: number;
  rng?: () => number;
};

export type DistributionResult<T> = {
  canoes: T[][];
  usedCanoes: number;
  unusedCanoes: number;
};

export type DistributionError = {
  ok: false;
  code: "TOO_FEW" | "CAPACITY_TOO_LOW";
  message: string;
};

export type DistributionOk<T> = { ok: true } & DistributionResult<T>;

export type Distribution<T> = DistributionOk<T> | DistributionError;

export function fisherYatesShuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Beregn antall kanoer som skal brukes. Returnerer feilmelding hvis det er umulig
 * å oppfylle alle reglene (min 2 per kano, ikke overskride maxPerCanoe, ikke
 * overskride maxCanoes).
 */
export function planCanoes(
  n: number,
  maxCanoes: number,
  maxPerCanoe: number,
): { ok: true; used: number } | DistributionError {
  if (n < 2) {
    return { ok: false, code: "TOO_FEW", message: "Minst 2 deltakere trengs for å trekke." };
  }
  if (maxCanoes < 1 || maxPerCanoe < 2) {
    return {
      ok: false,
      code: "CAPACITY_TOO_LOW",
      message: "Kanoer må være minst 1 og maks per kano minst 2.",
    };
  }
  const minByCapacity = Math.ceil(n / maxPerCanoe);
  const maxByMinTwo = Math.floor(n / 2);
  if (minByCapacity > maxCanoes) {
    return {
      ok: false,
      code: "CAPACITY_TOO_LOW",
      message: `Det trengs minst ${minByCapacity} kanoer for ${n} deltakere med maks ${maxPerCanoe} per kano. Øk antall kanoer eller maks-kapasitet.`,
    };
  }
  if (minByCapacity > maxByMinTwo) {
    // Typisk: oddetall deltakere med maxPerCanoe=2. Umulig å oppfylle både
    // min-2 og maks-cap samtidig uten å endre konfig eller deltakerantall.
    return {
      ok: false,
      code: "TOO_FEW",
      message: `${n} deltakere kan ikke fordeles med minst 2 og maks ${maxPerCanoe} per kano. Øk maks per kano, eller juster deltakerantall.`,
    };
  }
  const used = Math.min(maxCanoes, maxByMinTwo);
  return { ok: true, used };
}

export function distribute<T>(input: DistributionInput<T>): Distribution<T> {
  const { participants, maxCanoes, maxPerCanoe, rng } = input;
  const plan = planCanoes(participants.length, maxCanoes, maxPerCanoe);
  if (!plan.ok) return plan;

  const shuffled = fisherYatesShuffle(participants, rng);
  const canoes: T[][] = Array.from({ length: plan.used }, () => []);

  // Round-robin distribusjon gir naturlig jevn fordeling.
  shuffled.forEach((p, idx) => {
    canoes[idx % plan.used].push(p);
  });

  return {
    ok: true,
    canoes,
    usedCanoes: plan.used,
    unusedCanoes: Math.max(0, maxCanoes - plan.used),
  };
}

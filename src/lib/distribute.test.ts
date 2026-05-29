import { describe, expect, it } from "vitest";
import { distribute, fisherYatesShuffle, planCanoes } from "./distribute";

// Deterministisk RNG for testbarhet
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

describe("planCanoes", () => {
  it("avviser 0 og 1 deltaker", () => {
    expect(planCanoes(0, 4, 3)).toMatchObject({ ok: false, code: "TOO_FEW" });
    expect(planCanoes(1, 4, 3)).toMatchObject({ ok: false, code: "TOO_FEW" });
  });

  it("avviser ugyldig konfigurasjon", () => {
    expect(planCanoes(10, 0, 3)).toMatchObject({ ok: false, code: "CAPACITY_TOO_LOW" });
    expect(planCanoes(10, 4, 1)).toMatchObject({ ok: false, code: "CAPACITY_TOO_LOW" });
  });

  it("n=2 → 1 kano", () => {
    expect(planCanoes(2, 4, 3)).toEqual({ ok: true, used: 1 });
  });

  it("n=3 med maxCap=2 er umulig (min 2 per kano vs maks 2 per kano)", () => {
    expect(planCanoes(3, 4, 2)).toMatchObject({ ok: false, code: "TOO_FEW" });
  });

  it("n=3 med maxCap=3 → 1 kano", () => {
    expect(planCanoes(3, 4, 3)).toEqual({ ok: true, used: 1 });
  });

  it("n=7 (odde) med maxCap=2 er umulig — odd-one-out kan ikke pares", () => {
    expect(planCanoes(7, 4, 2)).toMatchObject({ ok: false, code: "TOO_FEW" });
  });

  it("n=7 med 4 kanoer maks 3 → 3 kanoer (minimum 3 for å passe 7/3)", () => {
    expect(planCanoes(7, 4, 3)).toEqual({ ok: true, used: 3 });
  });

  it("n=30 med 4 kanoer maks 2 → kapasitet for lav", () => {
    expect(planCanoes(30, 4, 2)).toMatchObject({ ok: false, code: "CAPACITY_TOO_LOW" });
  });

  it("n=30 med 15 kanoer maks 2 → 15 kanoer", () => {
    expect(planCanoes(30, 15, 2)).toEqual({ ok: true, used: 15 });
  });

  it("n=10 med 4 kanoer maks 3 → 4 kanoer (jevn fordeling 3-3-2-2)", () => {
    expect(planCanoes(10, 4, 3)).toEqual({ ok: true, used: 4 });
  });
});

describe("fisherYatesShuffle", () => {
  it("bevarer alle elementer", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const shuffled = fisherYatesShuffle(input, seeded(42));
    expect(shuffled.slice().sort()).toEqual(input);
  });

  it("muterer ikke input", () => {
    const input = [1, 2, 3];
    const copy = input.slice();
    fisherYatesShuffle(input, seeded(1));
    expect(input).toEqual(copy);
  });

  it("er deterministisk gitt samme seed", () => {
    const a = fisherYatesShuffle([1, 2, 3, 4, 5], seeded(7));
    const b = fisherYatesShuffle([1, 2, 3, 4, 5], seeded(7));
    expect(a).toEqual(b);
  });
});

describe("distribute", () => {
  it("fordeler alle deltakere uten tap", () => {
    const people = Array.from({ length: 12 }, (_, i) => `P${i + 1}`);
    const result = distribute({ participants: people, maxCanoes: 4, maxPerCanoe: 3, rng: seeded(1) });
    if (!result.ok) throw new Error(result.message);
    const all = result.canoes.flat().sort();
    expect(all).toEqual(people.slice().sort());
  });

  it("respekterer maks per kano", () => {
    const people = Array.from({ length: 10 }, (_, i) => i);
    const result = distribute({ participants: people, maxCanoes: 4, maxPerCanoe: 3, rng: seeded(2) });
    if (!result.ok) throw new Error(result.message);
    for (const c of result.canoes) {
      expect(c.length).toBeLessThanOrEqual(3);
    }
  });

  it("har minst 2 i hver brukt kano", () => {
    const people = Array.from({ length: 7 }, (_, i) => i);
    const result = distribute({ participants: people, maxCanoes: 4, maxPerCanoe: 3, rng: seeded(3) });
    if (!result.ok) throw new Error(result.message);
    for (const c of result.canoes) {
      expect(c.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("returnerer unusedCanoes når færre brukes", () => {
    const people = Array.from({ length: 4 }, (_, i) => i);
    const result = distribute({ participants: people, maxCanoes: 5, maxPerCanoe: 3, rng: seeded(4) });
    if (!result.ok) throw new Error(result.message);
    expect(result.usedCanoes).toBe(2);
    expect(result.unusedCanoes).toBe(3);
  });

  it("jevn fordeling: 30 deltakere på 15 kanoer = 2 per kano", () => {
    const people = Array.from({ length: 30 }, (_, i) => i);
    const result = distribute({ participants: people, maxCanoes: 15, maxPerCanoe: 2, rng: seeded(5) });
    if (!result.ok) throw new Error(result.message);
    expect(result.canoes.every((c) => c.length === 2)).toBe(true);
  });

  it("propagerer feil fra planCanoes", () => {
    const result = distribute({ participants: [1], maxCanoes: 4, maxPerCanoe: 3 });
    expect(result.ok).toBe(false);
  });
});

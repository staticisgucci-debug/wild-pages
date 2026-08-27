/**
 * A Trail only stores ONE colour. Everything else about how it looks -- the glow
 * behind the page, the drifting motes, the cover tint -- is worked out from that
 * one colour here.
 *
 * Why: so inventing a new Trail in The Study is picking a colour, not filling in
 * five colour fields and hoping they go together.
 */

export type TrailTheme = {
  accent: string;
  glow1: string;
  glow2: string;
  moteA: string;
  moteB: string;
};

const FALLBACK = "#d9682a";

/** Accepts "#abc", "abc", "#aabbcc" or "aabbcc". Returns null if it's not a colour. */
export function parseHex(input: string): { r: number; g: number; b: number } | null {
  const hex = input.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Tidies whatever was typed into a proper "#rrggbb", or falls back to ember. */
export function normalizeHex(input: string): string {
  const rgb = parseHex(input);
  if (!rgb) return FALLBACK;
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`;
}

export function isValidHex(input: string): boolean {
  return parseHex(input) !== null;
}

/** The same colour, see-through. Used for the soft glows. */
function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex) ?? parseHex(FALLBACK)!;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Slides a colour toward white (amount > 0) or black (amount < 0). */
function shift(hex: string, amount: number): string {
  const rgb = parseHex(hex) ?? parseHex(FALLBACK)!;
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const to2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${to2(rgb.r + (target - rgb.r) * t)}${to2(rgb.g + (target - rgb.g) * t)}${to2(
    rgb.b + (target - rgb.b) * t,
  )}`;
}

export function trailTheme(accent: string): TrailTheme {
  const base = normalizeHex(accent);
  return {
    accent: base,
    // A warm bloom from the edges of the page.
    glow1: withAlpha(shift(base, 0.25), 0.2),
    glow2: withAlpha(shift(base, -0.2), 0.12),
    // Motes are a lighter and a plain version of the Trail colour.
    moteA: shift(base, 0.45),
    moteB: base,
  };
}

/**
 * Builds the CSS that themes every Trail, generated from the database.
 *
 * This is what makes "invent a Trail at the click of a button" actually work:
 * add a row, and the rule for it appears here on the next page load.
 */
export function trailStylesheet(trails: { slug: string; accent: string }[]): string {
  return trails
    .map((trail) => {
      const theme = trailTheme(trail.accent);
      // Only slug characters we generate ourselves ever reach here, but this
      // strips anything odd anyway so a slug can never break out into CSS.
      const slug = trail.slug.replace(/[^a-z0-9-]/gi, "");
      if (!slug) return "";
      return `[data-trail="${slug}"]{--trail-accent:${theme.accent};--trail-glow-1:${theme.glow1};--trail-glow-2:${theme.glow2};--mote-a:${theme.moteA};--mote-b:${theme.moteB};}`;
    })
    .filter(Boolean)
    .join("\n");
}

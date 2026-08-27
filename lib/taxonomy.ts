/**
 * TRAILS AND LEVELS
 *
 * These are the "add it at the click of a button" presets. Everything we have
 * already designed lives in this file, so you never have to type it in. In The
 * Study you press "Add" next to any of them and it appears in the database.
 *
 * You can also invent your own from scratch. These are just a head start, not
 * a fixed list -- nothing in the app is limited to what's below.
 */

export type Trail = {
  slug: string;
  name: string;
  blurb: string;
  accent: string;
  sort_order: number;
  is_active: boolean;
};

export type Level = {
  slug: string;
  name: string;
  emoji: string;
  age_hint: string;
  blurb: string;
  sort_order: number;
  is_active: boolean;
};

/** One-click Trails. Ember is already in the database after running supabase.sql. */
export const PRESET_TRAILS: Omit<Trail, "is_active">[] = [
  { slug: "ember", name: "Ember Trail", blurb: "Fire, courage, survival", accent: "#d9682a", sort_order: 10 },
  { slug: "jungle", name: "Jungle Trail", blurb: "Animals, wild, lost worlds", accent: "#3f8f4f", sort_order: 20 },
  { slug: "frost", name: "Frost Trail", blurb: "Ice, silence, the far north", accent: "#3d7ea6", sort_order: 30 },
  { slug: "shadow", name: "Shadow Trail", blurb: "Spooky, strange, midnight", accent: "#6f55a3", sort_order: 40 },
  { slug: "star", name: "Star Trail", blurb: "Wonder, sky, far away", accent: "#b8892b", sort_order: 50 },
];

/**
 * One-click Levels, the Seed to Forest ladder.
 *
 * Only Canopy is active after running supabase.sql, because Canopy is the heart
 * of Wild Pages and the only Level with books in it. Add the others the day you
 * have something to put in them -- an empty shelf is worse than no shelf.
 *
 * Heads up on a name clash: "Shadow" and "Star" appear here AND in the Trails
 * above. A reader seeing "Canopy Shadow" and "Shadow Star" will not be able to
 * tell which word means an age band and which means a kind of story. Worth
 * picking one or the other before you switch these on.
 */
export const PRESET_LEVELS: Omit<Level, "is_active">[] = [
  { slug: "sprout", name: "Sprout", emoji: "🌱", age_hint: "3-6", blurb: "Big text, read together", sort_order: 20 },
  { slug: "sapling", name: "Sapling", emoji: "🌿", age_hint: "7-9", blurb: "First chapter adventures", sort_order: 30 },
  { slug: "canopy", name: "Canopy", emoji: "🌳", age_hint: "10-13", blurb: "Full adventures, about 30 minutes", sort_order: 40 },
  { slug: "shadow", name: "Shadow", emoji: "🌑", age_hint: "12-15", blurb: "Darker, stranger, deeper", sort_order: 50 },
  { slug: "star", name: "Star", emoji: "✨", age_hint: "12-15", blurb: "Wonder and the far away", sort_order: 60 },
  { slug: "codex", name: "Codex", emoji: "📖", age_hint: "Any", blurb: "Real skills: knots, tracks, stars, plants", sort_order: 70 },
];

/**
 * Used when the database isn't connected yet, so the app still runs and the
 * Reader still works instead of showing an error page.
 */
export const FALLBACK_TRAIL: Trail = {
  ...PRESET_TRAILS[0],
  is_active: true,
};

export const FALLBACK_LEVEL: Level = {
  ...PRESET_LEVELS[2],
  is_active: true,
};

/** Turns "Storm Trail" into "storm-trail" so it can be used in a web address. */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

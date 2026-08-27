/**
 * Reader settings. Saved in the browser (localStorage), never on a server --
 * so we store nothing about who is reading. Applied as data-attributes on the
 * <html> element, which lets plain CSS do all the theming work.
 */

export type Theme = "daylight" | "campfire";
export type TextSize = "s" | "m" | "l";
export type ReaderFont = "storybook" | "easy";

export type Settings = {
  theme: Theme;
  size: TextSize;
  font: ReaderFont;
  /** Stillness on = no drifting motes, no animations. For anyone who finds motion distracting. */
  stillness: boolean;
};

export const SETTINGS_KEY = "wp.settings";

export const defaultSettings: Settings = {
  theme: "daylight",
  size: "m",
  font: "storybook",
  stillness: false,
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme === "campfire" ? "campfire" : "daylight",
      size: parsed.size === "s" || parsed.size === "l" ? parsed.size : "m",
      font: parsed.font === "easy" ? "easy" : "storybook",
      stillness: Boolean(parsed.stillness),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* Private browsing or a full disk. Not worth breaking the story over. */
  }
}

export function applySettings(settings: Settings): void {
  const el = document.documentElement;
  el.dataset.theme = settings.theme;
  el.dataset.size = settings.size;
  el.dataset.font = settings.font;
  el.dataset.stillness = settings.stillness ? "on" : "off";
}

/**
 * Runs before the first paint, inlined in <head>, so a family reading in
 * Campfire mode never gets flashbanged by a white screen on load.
 */
export const SETTINGS_BOOT_SCRIPT = `try{
var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');
var d=document.documentElement;
d.dataset.theme=s.theme==='campfire'?'campfire':'daylight';
d.dataset.size=(s.size==='s'||s.size==='l')?s.size:'m';
d.dataset.font=s.font==='easy'?'easy':'storybook';
d.dataset.stillness=s.stillness?'on':'off';
}catch(e){}`;

/* ---- Where a reader stopped ------------------------------------------------
 * We save a PARAGRAPH number, never a page number. Page 12 at small text is
 * page 20 at large text, so saving pages would drop a kid in the wrong place
 * the moment they changed a setting. Paragraph 14 is always paragraph 14.
 * -------------------------------------------------------------------------- */

export type Progress = {
  paragraph: number;
  /** How many paragraphs the book has, so the library can show a percentage
      without having to download the book itself. */
  total: number;
  at: string;
};

export const progressKey = (slug: string) => `wp.progress.${slug}`;
export const finishedKey = (slug: string) => `wp.finished.${slug}`;

export function loadProgress(slug: string): Progress | null {
  try {
    const raw = window.localStorage.getItem(progressKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (typeof parsed.paragraph !== "number" || parsed.paragraph < 0) return null;
    return {
      paragraph: parsed.paragraph,
      total: typeof parsed.total === "number" && parsed.total > 0 ? parsed.total : 0,
      at: parsed.at ?? "",
    };
  } catch {
    return null;
  }
}

export function saveProgress(slug: string, paragraph: number, total: number): void {
  try {
    const value: Progress = { paragraph, total, at: new Date().toISOString() };
    window.localStorage.setItem(progressKey(slug), JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** 0 to 1, or null when we can't tell. */
export function progressFraction(progress: Progress | null): number | null {
  if (!progress || progress.total < 2) return null;
  return Math.min(1, Math.max(0, progress.paragraph / (progress.total - 1)));
}

export function markFinished(slug: string): void {
  try {
    window.localStorage.setItem(finishedKey(slug), new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function isFinished(slug: string): boolean {
  try {
    return Boolean(window.localStorage.getItem(finishedKey(slug)));
  } catch {
    return false;
  }
}

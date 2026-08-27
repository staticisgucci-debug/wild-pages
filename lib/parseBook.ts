import { SCENE_BREAK, type Chapter } from "./types";

/** Average middle-grade reading speed, words per minute. Used for the "X min" label. */
const WORDS_PER_MINUTE = 130;

/** Non-breaking, figure, narrow and thin spaces. They look like spaces but don't behave like them. */
const ODD_SPACES = /[\u00A0\u2007\u2009\u202F]/g;

/** Zero-width space/joiners, word joiner, byte-order mark. Invisible, and total troublemakers. */
const INVISIBLES = /[\u200B-\u200D\u2060\uFEFF]/g;

/** Bullets that Word and Google Docs paste in at the start of a line. */
const PASTED_BULLETS = /^[\u2022\u00B7\u25CF]\s+/gm;

/**
 * Scrubs the invisible junk that Google Docs and Word smuggle in when you paste.
 *
 * We deliberately KEEP curly quotes and em dashes -- they are what real books
 * use, and they look better than straight quotes. What we strip is only the
 * stuff you cannot see but which quietly breaks the page layout.
 */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n") // Windows / old Mac line endings -> plain newlines
    .replace(ODD_SPACES, " ")
    .replace(INVISIBLES, "")
    .replace(PASTED_BULLETS, "")
    .replace(/[ \t]+$/gm, "") // trailing spaces on a line
    .replace(/\n{3,}/g, "\n\n") // 3+ blank lines -> one blank line
    .trim();
}

export function countWords(text: string): number {
  const words = text.match(/[\p{L}\p{N}'\u2019-]+/gu);
  return words ? words.length : 0;
}

export function minutesFor(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

/** A line of only asterisks, dashes or underscores = a decorative scene break. */
const SCENE_BREAK_LINE = /^(?:\*[ \t]*){3,}$|^-{3,}$|^_{3,}$/;

/**
 * Splits one chapter's body text into paragraphs.
 *
 * Handles both ways people paste:
 *   - Blank lines between paragraphs (the normal case) -> split on blank lines.
 *   - No blank lines at all, one paragraph per line -> split on every line.
 * Without that second rule, a paste from certain editors would collapse an
 * entire chapter into one enormous paragraph.
 */
function toParagraphs(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const hasBlankLines = /\n[ \t]*\n/.test(trimmed);
  const chunks = hasBlankLines ? trimmed.split(/\n[ \t]*\n/) : trimmed.split(/\n/);

  return chunks
    .map((chunk) => chunk.replace(/\s*\n\s*/g, " ").trim()) // a lone break inside a paragraph is just a wrap
    .filter(Boolean)
    .map((p) => (SCENE_BREAK_LINE.test(p) ? SCENE_BREAK : p));
}

export type ParsedBook = {
  /** Taken from a leading `# Title` line if there is one. */
  title: string | null;
  chapters: Chapter[];
  wordCount: number;
  minutes: number;
};

/**
 * Turns pasted text into chapters. The entire format is two rules:
 *   1. A line starting with `##` begins a new chapter.
 *   2. A blank line begins a new paragraph.
 * A `# Title` line at the top becomes the book title. `***` is a scene break.
 */
export function parseBook(raw: string): ParsedBook {
  const text = cleanText(raw);

  // Pull off a leading `# Book Title` if the very first line is one.
  // (Checked explicitly rather than with a regex over the whole document, so a
  // `#` further down can never be mistaken for the title.)
  let title: string | null = null;
  let body = text;
  const firstBreak = body.indexOf("\n");
  const firstLine = (firstBreak === -1 ? body : body.slice(0, firstBreak)).trim();
  if (/^#[^#]/.test(firstLine)) {
    title = firstLine.replace(/^#[ \t]*/, "").trim();
    body = firstBreak === -1 ? "" : body.slice(firstBreak + 1);
  }

  // Split on `##` chapter headings.
  const parts = body.split(/^##[ \t]*/m);
  const preamble = parts.shift() ?? "";

  const chapters: Chapter[] = [];

  // Text before the first `##` becomes an untitled opening section -- a prologue,
  // or the entire book when there are no headings at all.
  const preParagraphs = toParagraphs(preamble);
  if (preParagraphs.length) {
    chapters.push({ title: "Untitled", paragraphs: preParagraphs });
  }

  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const rest = newline === -1 ? "" : part.slice(newline + 1);
    chapters.push({ title: heading || "Untitled", paragraphs: toParagraphs(rest) });
  }

  const wordCount = chapters.reduce(
    (sum, ch) =>
      sum +
      countWords(ch.title ?? "") +
      ch.paragraphs.reduce((s, p) => s + (p === SCENE_BREAK ? 0 : countWords(p)), 0),
    0,
  );

  return { title, chapters, wordCount, minutes: minutesFor(wordCount) };
}

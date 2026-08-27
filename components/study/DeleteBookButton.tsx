"use client";

import { useState } from "react";
import { deleteBook } from "@/app/study/actions";

/**
 * Deleting a book you wrote is the one action here with no undo, so it takes two
 * deliberate steps: reveal, then confirm. No single mis-tap can lose a story.
 */
export default function DeleteBookButton({ slug, title }: { slug: string; title: string }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        className="study-button study-button--danger"
        onClick={() => setArmed(true)}
      >
        Delete this book
      </button>
    );
  }

  return (
    <form action={deleteBook} className="study-row">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="study-button study-button--danger">
        Yes, delete &ldquo;{title}&rdquo; for good
      </button>
      <button
        type="button"
        className="study-button study-button--quiet"
        onClick={() => setArmed(false)}
      >
        Keep it
      </button>
    </form>
  );
}

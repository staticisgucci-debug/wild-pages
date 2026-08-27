"use client";

import Link from "next/link";

export default function LoginForm() {
  return (
    <div className="study-card" style={{ maxWidth: "26rem" }}>
      <div className="study-brand-wrap" aria-hidden="true">
        <span className="study-brand-badge">Wild Pages</span>
      </div>

      <div className="study-badge-row">
        <span className="study-mini-pill">Author access</span>
      </div>

      <h1 className="study-h1">Private Study</h1>
      <p className="study-hint">
        This area is restricted to site admins. Please sign in via the main login page.
      </p>

      <div className="study-actions">
        <Link href="/login" className="study-button">Sign in</Link>
        <Link href="/" className="study-button study-button--quiet study-button--link">
          Back to the library
        </Link>
      </div>
    </div>
  );
}

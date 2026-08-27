"use client";

import { useState, useTransition } from "react";
import {
  addPresetLevel,
  addPresetTrail,
  deleteTaxonomy,
  saveLevel,
  saveTrail,
  setTaxonomyActive,
} from "@/app/study/actions";
import { trailTheme } from "@/lib/colors";
import type { Level, Trail } from "@/lib/taxonomy";

type Props = {
  trails: Trail[];
  levels: Level[];
  presetTrails: Omit<Trail, "is_active">[];
  presetLevels: Omit<Level, "is_active">[];
};

export default function TaxonomyManager({ trails, levels, presetTrails, presetLevels }: Props) {
  const existingTrailSlugs = new Set(trails.map((t) => t.slug));
  const existingLevelSlugs = new Set(levels.map((l) => l.slug));
  const missingTrails = presetTrails.filter((p) => !existingTrailSlugs.has(p.slug));
  const missingLevels = presetLevels.filter((p) => !existingLevelSlugs.has(p.slug));

  return (
    <>
      <section className="study-card">
        <h2 className="study-h2">Trails</h2>
        {trails.map((trail) => (
          <TaxonomyRow key={`trail-${trail.slug}`} table="trails" slug={trail.slug} active={trail.is_active}>
            <span className="study-swatch" style={{ background: trail.accent }} />
            <span className="study-item__grow">
              <span className="study-item__title">{trail.name}</span>
              <span className="study-item__sub">{trail.slug} {trail.blurb && ` — ${trail.blurb}`}</span>
            </span>
          </TaxonomyRow>
        ))}
        {missingTrails.map((preset) => (
          <form key={`preset-trail-${preset.slug}`} action={addPresetTrail}>
            <input type="hidden" name="slug" value={preset.slug} />
            <button type="submit" className="study-button study-button--quiet study-button--small">{preset.name}</button>
          </form>
        ))}
        <TrailEditor />
      </section>

      <section className="study-card">
        <h2 className="study-h2">Levels</h2>
        {levels.map((level) => (
          <TaxonomyRow key={`level-${level.slug}`} table="levels" slug={level.slug} active={level.is_active}>
            <span className="study-swatch" style={{ display: "grid", placeItems: "center", background: "#0b1310" }}>{level.emoji}</span>
            <span className="study-item__grow">
              <span className="study-item__title">{level.name}</span>
              <span className="study-item__sub">{level.slug}</span>
            </span>
          </TaxonomyRow>
        ))}
        {missingLevels.map((preset) => (
          <form key={`preset-level-${preset.slug}`} action={addPresetLevel}>
            <input type="hidden" name="slug" value={preset.slug} />
            <button type="submit" className="study-button study-button--quiet study-button--small">{preset.emoji} {preset.name}</button>
          </form>
        ))}
        <LevelEditor />
      </section>
    </>
  );
}

function TaxonomyRow({ table, slug, active, children }: { table: "trails" | "levels"; slug: string; active: boolean; children: React.ReactNode; }) {
  return (
    <div className="study-item" data-inactive={!active}>
      {children}
      <form action={setTaxonomyActive}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="active" value={active ? "false" : "true"} />
        <button type="submit" className="study-button study-button--quiet study-button--small">{active ? "Hide" : "Show"}</button>
      </form>
      <form action={deleteTaxonomy}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="slug" value={slug} />
        <button type="submit" className="study-button study-button--danger study-button--small">Delete</button>
      </form>
    </div>
  );
}

function TrailEditor() {
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState("#3f8f4f");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, startTransition] = useTransition();
  const theme = trailTheme(accent);

  if (!open) return <button className="study-button study-button--quiet" onClick={() => setOpen(true)}>+ Invent a new Trail</button>;

  async function handleSubmit(formData: FormData) {
    setError(""); setOk("");
    startTransition(async () => {
      const res: any = await saveTrail(formData as any);
      if (res?.error) setError(res.error);
      if (res?.ok) { setOk(res.ok); setOpen(false); }
    });
  }

  return (
    <form action={handleSubmit} style={{ marginTop: "1.2rem", borderTop: "1px solid var(--s-line)", paddingTop: "1rem" }}>
      <input name="name" required placeholder="Storm Trail" className="study-input" />
      <input name="blurb" placeholder="Wind, rain, the sea" className="study-input" />
      <input name="accent" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} style={{ width: "4.5rem", height: "2.85rem" }} />
      <input type="hidden" name="accent" value={accent} />
      <input name="sort_order" type="number" defaultValue={100} className="study-input" style={{ maxWidth: "8rem" }} />
      <label><input type="checkbox" name="is_active" defaultChecked /> Show it</label>
      {error && <p className="study-error">{error}</p>}
      {ok && <p className="study-ok">{ok}</p>}
      <button type="submit" disabled={pending}>{pending ? "Saving..." : "Create Trail"}</button>
      <button type="button" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}

function LevelEditor() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) return <button className="study-button study-button--quiet" onClick={() => setOpen(true)}>+ Invent a new Level</button>;

  async function handleSubmit(formData: FormData) {
    setError(""); setOk("");
    startTransition(async () => {
      const res: any = await saveLevel(formData as any);
      if (res?.error) setError(res.error);
      if (res?.ok) { setOk(res.ok); setOpen(false); }
    });
  }

  return (
    <form action={handleSubmit} style={{ marginTop: "1.2rem", borderTop: "1px solid var(--s-line)", paddingTop: "1rem" }}>
      <input name="name" required placeholder="Thicket" className="study-input" />
      <input name="emoji" placeholder="🌲" className="study-input" />
      <input name="age_hint" placeholder="12-13" className="study-input" />
      <input name="blurb" placeholder="Longer books, harder words" className="study-input" />
      <input name="sort_order" type="number" defaultValue={100} className="study-input" style={{ maxWidth: "8rem" }} />
      <label><input type="checkbox" name="is_active" defaultChecked /> Show it</label>
      {error && <p className="study-error">{error}</p>}
      {ok && <p className="study-ok">{ok}</p>}
      <button type="submit" disabled={pending}>{pending ? "Saving..." : "Create Level"}</button>
      <button type="button" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
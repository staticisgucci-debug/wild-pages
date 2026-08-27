import TaxonomyManager from "@/components/study/TaxonomyManager";
import { getLevels, getTrails } from "@/lib/content";
import { PRESET_LEVELS, PRESET_TRAILS } from "@/lib/taxonomy";
import { supabaseReady } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TaxonomyPage() {
  // activeOnly: false — in here you need to see the hidden ones too.
  const [trails, levels] = await Promise.all([
    getTrails({ activeOnly: false }),
    getLevels({ activeOnly: false }),
  ]);

  return (
    <>
      <h1 className="study-h1">Trails &amp; Levels</h1>
      <p className="study-hint">
        These are the shelves of your library. A book is always one Trail plus one
        Level. Change anything here and the whole site follows &mdash; no code, no
        deploy.
      </p>

      <TaxonomyManager
        trails={supabaseReady ? trails : []}
        levels={supabaseReady ? levels : []}
        presetTrails={PRESET_TRAILS}
        presetLevels={PRESET_LEVELS}
      />
    </>
  );
}

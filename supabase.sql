-- ===========================================================================
-- WILD PAGES - database setup
-- ---------------------------------------------------------------------------
-- HOW TO USE THIS FILE:
--   1. Open your project on supabase.com
--   2. Click "SQL Editor" in the left sidebar, then "New query"
--   3. Copy this whole file, paste it in, and press Run.
--
-- It is safe to run more than once. Everything below either creates a thing or
-- skips it if it already exists, so re-running will not delete your books.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. TRAILS  (your genres - Ember, Jungle, Frost, and any you invent)
-- ---------------------------------------------------------------------------
-- You manage these from The Study. Each Trail has ONE colour; the glows, the
-- drifting motes and the page tint are all worked out from it automatically.

create table if not exists trails (
  slug        text primary key,
  name        text not null,
  blurb       text not null default '',
  accent      text not null default '#d9682a',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 2. LEVELS  (the Seed to Forest ladder)
-- ---------------------------------------------------------------------------
-- Only Canopy exists at launch. Sprout, Sapling, Shadow, Star and Codex are
-- one-click presets in The Study, so adding them later is a button, not code.

create table if not exists levels (
  slug        text primary key,
  name        text not null,
  emoji       text not null default '',
  age_hint    text not null default '',
  blurb       text not null default '',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 3. BOOKS
-- ---------------------------------------------------------------------------
-- `source_text` is exactly what you pasted, kept so you can fix a typo in
-- chapter four without retyping the book.
-- `content_json` is the parsed version the Reader actually uses.
-- `word_count` and `minutes` are worked out from the text, never typed by hand,
-- so the "30 minute book" label is always honest.

create table if not exists books (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  trail         text not null references trails(slug) on update cascade,
  level         text not null references levels(slug) on update cascade,
  source_text   text not null default '',
  content_json  jsonb not null default '[]'::jsonb,
  word_count    integer not null default 0,
  minutes       integer not null default 1,
  cover_url     text,
  cover_color   text not null default '#d9682a',
  -- Nothing that is still a draft is ever served to a reader.
  status        text not null default 'draft' check (status in ('draft', 'published')),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Kept as its own column so the library can list every book WITHOUT loading
-- every book's full text. With fifty books that is the difference between a
-- few kilobytes and several megabytes on the shelf page.
alter table books add column if not exists chapter_count integer not null default 0;

create index if not exists books_status_idx on books (status);
create index if not exists books_trail_idx  on books (trail);
create index if not exists books_level_idx  on books (level);


-- ---------------------------------------------------------------------------
-- 4. PACKS  (families - used from Slice 3 onward)
-- ---------------------------------------------------------------------------
-- Note what is NOT here: no child's age, no birthday, no email for any kid.
-- The only email we ever store is the grown-up who set the Pack up.

create table if not exists packs (
  id                 uuid primary key default gen_random_uuid(),
  pack_name          text not null,
  sigil              text not null default '',
  keeper_email       text,
  email_opt_in       boolean not null default false,
  unsubscribe_token  uuid not null default gen_random_uuid(),
  created_at         timestamptz not null default now()
);

create table if not exists pack_members (
  id            uuid primary key default gen_random_uuid(),
  pack_id       uuid not null references packs(id) on delete cascade,
  display_name  text not null,
  avatar        text not null default '',
  is_keeper     boolean not null default false,
  sort_order    integer not null default 0,
  -- Unused at launch, because with only one Level there is nothing to choose.
  -- Ready for the day a second Level exists.
  level         text references levels(slug) on update cascade,
  created_at    timestamptz not null default now()
);

create index if not exists pack_members_pack_idx on pack_members (pack_id);


-- ---------------------------------------------------------------------------
-- 5. READS  (where each reader is up to)
-- ---------------------------------------------------------------------------
-- We store a PARAGRAPH, not a page. Page 12 at small text is page 20 at large
-- text, so saving a page number would drop a kid in the wrong place the moment
-- they changed a setting.

create table if not exists reads (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references pack_members(id) on delete cascade,
  book_id       uuid not null references books(id) on delete cascade,
  paragraph     integer not null default 0,
  last_read_at  timestamptz not null default now(),
  completed_at  timestamptz,
  -- Without this, every page turn could create a new row forever.
  unique (member_id, book_id)
);

create index if not exists reads_member_idx on reads (member_id);


-- ===========================================================================
-- 6. SECURITY  -  the most important part of this file
-- ---------------------------------------------------------------------------
-- The "anon" key lives in the browser, where anyone can read it. So we must
-- assume a stranger has it. Turning on Row Level Security with no policy means
-- that key can do NOTHING - it cannot list families, emails, or children.
--
-- Everything the app needs to read or write goes through our own server code,
-- which uses the secret service_role key and never leaves the server.
--
-- The single exception is published books. Those are public content by
-- definition, so letting the browser read them directly is safe, and it is what
-- will make offline reading straightforward later.
-- ===========================================================================

alter table trails       enable row level security;
alter table levels       enable row level security;
alter table books        enable row level security;
alter table packs        enable row level security;
alter table pack_members enable row level security;
alter table reads        enable row level security;

-- Anyone may read the list of active Trails and Levels. These are just labels
-- and colours - there is nothing private about them.
drop policy if exists "active trails are public" on trails;
create policy "active trails are public"
  on trails for select
  using (is_active = true);

drop policy if exists "active levels are public" on levels;
create policy "active levels are public"
  on levels for select
  using (is_active = true);

-- Published books are public. Drafts are invisible to everyone but the server.
drop policy if exists "published books are public" on books;
create policy "published books are public"
  on books for select
  using (status = 'published');

-- packs, pack_members and reads get NO policies at all. That is deliberate:
-- with RLS on and no policy, the public key is refused every time.


-- ---------------------------------------------------------------------------
-- 7. COVER IMAGES
-- ---------------------------------------------------------------------------
-- A public bucket, because a book cover is meant to be looked at. Uploads still
-- go through our server, which checks the file is really an image and not too
-- big before it ever reaches here.

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers are publicly readable" on storage.objects;
create policy "covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'covers');


-- ---------------------------------------------------------------------------
-- 8. A STARTING TRAIL AND LEVEL
-- ---------------------------------------------------------------------------
-- Just enough to upload your first book. Everything else is a button in The Study.

insert into trails (slug, name, blurb, accent, sort_order)
values ('ember', 'Ember Trail', 'Fire, courage, survival', '#d9682a', 10)
on conflict (slug) do nothing;

insert into levels (slug, name, emoji, age_hint, blurb, sort_order)
values ('canopy', 'Canopy', '🌳', '10-13', 'Full adventures, about 30 minutes', 40)
on conflict (slug) do nothing;


-- ---------------------------------------------------------------------------
-- Done. You should see "Success. No rows returned."
-- ---------------------------------------------------------------------------

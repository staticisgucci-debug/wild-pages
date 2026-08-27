# Wild Pages — setup

Two things to set up, once. About ten minutes. Nothing here needs you to write code.

---

## 1. The Study password (2 minutes)

The Study is your private area where books get uploaded. It needs a password.

**Make two long random strings.** In your terminal, run this twice and copy each answer:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

**Make your settings file.** In the `wild-pages` folder, copy `.env.example` and name the copy
`.env.local`. Open it and fill in:

```
STUDY_PASSWORD=<the first random string>
SESSION_SECRET=<the second random string>
```

Restart `npm run dev`. Go to <http://localhost:3000/study> and log in.

> `.env.local` is already excluded from git, so it can never be uploaded by accident.
> The password is checked on the server and stored nowhere else. If you lose it, just
> put a new one in the file and restart.

---

## 2. The database (8 minutes)

Until this is done, the app still runs — it just shows the sample book and can't save anything.

### Create the project

1. Go to <https://supabase.com> and sign up (free).
2. **New project.** Name it `wild-pages`. Pick a region near you — Singapore is closest to
   Thailand. Set a database password and save it somewhere; you won't need it often.
3. Wait about two minutes while it builds.

### Create the tables

4. In the left sidebar click **SQL Editor**, then **New query**.
5. Open `supabase.sql` from your project folder, copy the whole thing, paste it in, press **Run**.
6. You should see *"Success. No rows returned."* That's correct — it made the tables, it didn't
   add any books.

### Copy your keys

7. In the left sidebar click **Settings** (the gear), then **API keys**.
8. You need three values. Put them in `.env.local`:

| On the Supabase page | Goes into |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL=` |
| `anon` / `publishable` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY=` |
| `service_role` / `secret` key (click to reveal) | `SUPABASE_SERVICE_ROLE_KEY=` |

9. Restart `npm run dev`.

> **About that third key.** The `service_role` key can read and write everything, ignoring all
> security rules. It only ever runs on the server and is never sent to a browser. Don't paste it
> into a chat, a screenshot, or any file other than `.env.local`. If it ever leaks, go to that
> same Supabase page and rotate it.

The orange warning banner in The Study disappears once all three are in place.

---

## 3. Your first book

1. Go to **The Study → Trails & Levels**. Ember Trail and Canopy are already there from the SQL.
   Add any others you want with the one-click buttons.
2. Go to **Books → New book**.
3. Paste your story in, or drag a `.md` / `.txt` file onto the box. Watch the word count and
   reading time work themselves out as you type.
4. Pick a Trail and a Level, drag on a cover image, press **Save as draft**.
5. Press **Preview** to read it in the real Reader, exactly as a kid would see it.
6. Happy with it? Press **Publish**. Now it's in the library.

### The book format

The whole thing is two rules:

```markdown
# The Long Water            <- the book title (optional)

## Chapter One: Smoke       <- a line starting with ## begins a new chapter

The smoke came over the ridge.

Wren saw it from the tank.  <- a blank line begins a new paragraph

***                         <- three asterisks make a scene break

## Chapter Two: The Water
```

No `##` headings at all is fine too — the book just reads as one continuous story.

`content/books/the-long-water.md` is a full worked example you can open and copy the shape of.

---

## Everyday commands

```powershell
cd C:\Users\oldpi\wild-pages
npm run dev        # work on it — visit http://localhost:3000
npm run build      # check everything still compiles before deploying
```

To read it on a phone or tablet on the same wifi, use the `Network:` address that
`npm run dev` prints, e.g. `http://192.168.1.107:3000`. The device must be on wifi, not
cellular data.

---

## What is where

| Folder | What's in it |
|---|---|
| `app/` | The pages. `page.tsx` is the landing page, `read/` is the Reader, `study/` is your admin |
| `components/` | Reusable pieces — the Reader, the vine, the growing tree |
| `lib/` | The thinking parts — the book parser, colours, security, database access |
| `content/books/` | The sample book, kept as a format example |
| `supabase.sql` | The database setup, safe to re-run any time |

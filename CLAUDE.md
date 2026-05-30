# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step — open any HTML file directly or use a simple server:

```bash
python3 -m http.server 3000
# visit http://localhost:3000
```

To deploy the Edge Function:
```bash
supabase functions deploy ai-chat --project-ref xiwrvbtryeesfgeydxnf
```

To run SQL against the remote DB:
```bash
supabase link --project-ref xiwrvbtryeesfgeydxnf
supabase db query --linked "SELECT ..."
```

## Architecture

**Pure HTML/JS, no framework, no bundler.** Every page is a self-contained HTML file with all CSS and JS written inline. There is no shared stylesheet or JS module — each file is independent.

**Stack:**
- Frontend: plain HTML files, all styles and scripts inline per page
- Auth + DB: Supabase (project ref: `xiwrvbtryeesfgeydxnf`)
- AI: Claude Haiku (`claude-haiku-4-5-20251001`) via a Supabase Edge Function (`supabase/functions/ai-chat/index.ts`)
- Hosting: GitHub Pages at `https://ashiesha2011-code.github.io/StudyEase/`

**AI flow:**
All AI calls go to `https://xiwrvbtryeesfgeydxnf.supabase.co/functions/v1/ai-chat`. JWT verification is **disabled** in the Supabase dashboard. The `ANTHROPIC_API_KEY` is stored as a Supabase Edge Function secret.

The Edge Function uses **two different system prompts** depending on the message:
- Messages starting with `[Physics]`, `[Chemistry]`, `[Biology]`, or `[Maths]` → academic-only CBSE board exam prompt
- All other messages (general chat) → dual-role prompt: academic help + mental health counselling/emotional support

The `netlify/functions/` directory is legacy — ignore it.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Landing / marketing page |
| `dashboard.html` | Main dashboard after login |
| `ai.html` | Full AI companion chat with sidebar history |
| `physics.html` | Physics subject page |
| `chemistry.html` | Chemistry subject page |
| `biology.html` | Biology subject page |
| `maths.html` | Maths subject page |
| `progress.html` | Progress tracking |
| `video-player.html` | Video player — Ch.1 Real Numbers |
| `video-player-ch2.html` | Video player — Ch.2 Polynomials |
| `session-player.html` | Live session player — Ch.1 Real Numbers |
| `session-player-ch2.html` | Live session player — Ch.2 Polynomials |
| `breathing.html` | Mindfulness page — breathing + meditation |
| `quiz.html` | Quiz page |

## Supabase Schema

All tables have RLS enabled. Users can only access their own rows.

### `profiles`
User profiles. Columns: `id`, `plan`, `class`, etc.

### `scores`
Quiz/session scores. Columns: `id`, `user_id`, `chapter`, `correct`, `total`, `pct`, `early`, `created_at`.

### `chat_history`
AI conversation history. Columns: `id` (uuid), `user_id` (uuid FK), `user_message` (text), `ai_reply` (text), `subject` (text), `created_at` (timestamptz).

### `mood_checkins`
Unified mental health + mindfulness table. Columns:
- `id` (uuid PK)
- `user_id` (uuid FK → auth.users)
- `mood` (text, nullable) — one of: `great`, `okay`, `stressed`, `struggling` — only set for type='mood'
- `type` (text, NOT NULL) — one of: `mood`, `breathing`, `meditation`
- `mode` (text, nullable) — breathing mode: `box`, `478`, `simple`; meditation: `guided`
- `duration` (integer, nullable) — seconds elapsed for breathing/meditation sessions
- `date` (text) — `new Date().toDateString()` format e.g. "Fri May 30 2026"
- `created_at` (timestamptz)

Unique constraint: `(user_id, date)` — but only enforced via upsert for mood rows. Breathing/meditation rows are inserted fresh each time.

## AI on Each Page

### ai.html (General AI companion)
- Full ChatGPT-style interface with left sidebar showing conversation history
- Conversations grouped by: subject change OR 1-hour time gap (whichever comes first)
- Subject filter tabs at top — prefixes message with `[Subject]` when selected
- History loaded from `chat_history` table on auth
- Sidebar shows Today / Yesterday / day-of-week groupings with delete buttons
- View-only mode when clicking past conversations

### Subject pages (physics / chemistry / biology / maths)
- Floating "Ask AI" widget (bottom-right FAB button)
- Prefixes message with `[SubjectName]` before sending to Edge Function
- Saves to `chat_history` with correct subject field
- Uses `window._sb` (Supabase client) and `window._userId` set on each page

### video-player.html + video-player-ch2.html
- Has a built-in AI panel in the page sidebar (shows/hides via controls bar "Ask AI" button)
- **Real API calls** — uses the Supabase Edge Function (NOT hardcoded answers)
- Also has a floating purple FAB (bottom-right, 52×52px, `#8B5CF6`) that opens the same panel
- Ch1 prefixes with `[Real Numbers]`, Ch2 prefixes with `[Maths]`
- Maintains `aiHistory` array (last 20 messages) for conversation context

### session-player.html + session-player-ch2.html
- Fullscreen black video player — no sidebar, no topbar
- Floating purple FAB (bottom-right) opens a 340px popup chat panel
- FAB **automatically hides** when a poll overlay or ready-prompt is showing, reappears after
- Uses same real API pattern with chapter prefix
- Poll/ready hiding implemented via classList.add/remove patching on `#ready-prompt` and `#poll-overlay`

## Dashboard

### AI CTA button
The old inline AI chat card was removed. Replaced with a large dark banner button linking directly to `ai.html`.

### Weekly Check-in (mental health)
- Four mood buttons: Great / Okay / Stressed / Struggling
- On tap: shows a tailored tip message + always-visible "🧘 Try mindfulness" pill button linking to `breathing.html`
- Mood saved to **localStorage** (`se_mood` key: `{mood, date}`) AND **Supabase** (`mood_checkins` table, type='mood')
- `currentUserId` is stored when `onAuthStateChange` fires and used directly for DB saves (do not use `getSession()` inside event handlers — it caused silent failures before)
- On page load: if today's mood is in localStorage, restores it without re-saving (`skipSave=true`)
- Stressed/Struggling responses include encouragement and breathing link; Great/Okay include a study tip

### Sidebar
Links: Dashboard, My Progress, AI Companion, NCERT Notes, Physics, Chemistry, Biology, Mathematics, Practice Questions, Past Papers, Flashcards, **Breathing** (→ breathing.html), Progress, Settings.

## Mindfulness Page (breathing.html)

Standalone page — **no login required** to use, but saves to DB if logged in.

### Two tabs:
**🫁 Breathing:**
- Three modes: Box Breathing (4-4-4-4), 4-7-8 (4-7-8), Simple Deep Breath (4-4-8)
- Animated circle scales up/down in sync with each phase
- Live countdown inside the circle
- **Audio (Web Audio API — no files):**
  - 3-2-1 countdown beeps (triangle wave) in last 3 seconds of each phase
  - Phase-transition chimes: rising two-note for inhale, neutral for hold, falling two-note for exhale
- Duration: 2 / 5 / 10 min or Custom (1–60 min input)

**🧘 Meditation:**
- Slow pulsing purple orb (CSS animation, no JS)
- Guided prompts rotate every 20 seconds ("Focus on your breath", "Let your thoughts pass like clouds", etc.)
- Countdown timer showing time remaining
- Duration: 5 / 10 / 15 min or Custom
- **Ambient music toggle (Web Audio API — no files):**
  - 4 layers of slightly detuned sine wave pairs → warm beating drone sound
  - Fades in over 3 seconds, fades out over 2 seconds
  - Bell chimes (3-harmonic, rich tone) at session start, every 30 seconds, and at session end

### DB saving:
- Loads Supabase SDK, calls `getUser()` on load to get `_uid`
- On session stop: inserts row into `mood_checkins` with `type='breathing'` or `'meditation'`, `mode`, `duration` (seconds elapsed)
- Also tracks session count in localStorage (`se_breath` key: `{date, sessions}`) and shows badge

## Brand / Design Tokens

| Token | Value |
|-------|-------|
| Primary navy | `#0A1628` |
| Accent blue | `#3B82F6` |
| Purple | `#8B5CF6` |
| Success/teal | `#10B981` / `#14B8A6` |
| Font | DM Sans (via Google Fonts) |
| Border radius | 12px (card), 14px (input) |
| Content padding | `30px 36px` (desktop), `18px` (mobile) |

General sizing philosophy: slightly larger than typical — bigger padding, bigger font sizes, more breathing room. Subject cards use `26px 22px` padding, `2.4rem` emoji, `1.05rem` name.

## Key Deployment Notes

- After pushing to `main`, GitHub Pages redeploys in ~1–2 minutes.
- The `netlify.toml` and `netlify/functions/` directory are legacy — ignore them.
- To update the Edge Function: edit `supabase/functions/ai-chat/index.ts` and run `supabase functions deploy ai-chat --project-ref xiwrvbtryeesfgeydxnf`
- The Supabase anon key is hardcoded in every HTML file — intentional for a pure-frontend app with RLS enabled.
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpd3J2YnRyeWVlc2ZnZXlkeG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTQ0NDAsImV4cCI6MjA5NDU5MDQ0MH0.3Sp9dlc8cNsrzdHAGy74pCqscjL1MFV9ZWMW90QbhqE`

## Known Gotchas

- **Never use `getSession()` inside event handlers to get the user ID** — it can return null due to timing. Always store `currentUserId` from `onAuthStateChange` and reference it directly.
- **Supabase upsert errors are NOT thrown** — they're in `res.error`. Always use `.then(function(res){ if(res.error) console.error(...) })` not just `.catch()`.
- **`groupConversations` in ai.html** splits on subject change OR time gap — both conditions. This ensures subject-page chats (Physics, Maths, etc.) always appear as separate sidebar entries.
- **breathing.html saves to `mood_checkins`**, not a separate table. The `mood` column is nullable for breathing/meditation rows.
- The `mood_checkins` unique constraint `(user_id, date)` only applies to upserts from the dashboard mood check-in. Breathing/meditation sessions use plain insert (multiple per day is fine).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Stats

**Total lines of code: 14,200** (14,093 across 15 HTML files + 107 in the Supabase Edge Function)

| File | Lines |
|------|-------|
| `index.html` | 2,195 |
| `session-player-ch2.html` | 1,253 |
| `session-player.html` | 1,239 |
| `video-player.html` | 1,190 |
| `video-player-ch2.html` | 1,155 |
| `dashboard.html` | 1,109 |
| `quiz.html` | 787 |
| `maths.html` | 765 |
| `ai.html` | 930 |
| `progress.html` | 561 |
| `physics.html` | 631 |
| `chemistry.html` | 631 |
| `biology.html` | 631 |
| `breathing.html` | 507 |
| `settings.html` | 509 |
| `supabase/functions/ai-chat/index.ts` | 107 |

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
All AI calls go to `https://xiwrvbtryeesfgeydxnf.supabase.co/functions/v1/ai-chat`. Every fetch call **must** include `Authorization: Bearer <anon_key>` — JWT verification is NOT disabled; the function rejects requests without this header. The `ANTHROPIC_API_KEY` is stored as a Supabase Edge Function secret.

The Edge Function (`supabase/functions/ai-chat/index.ts`) routes messages to subject-specific system prompts via `getSystem(message)`:

| Message prefix | System prompt used | Scope |
|---|---|---|
| `[Physics]` | `PHYSICS_SYSTEM` | Physics only — redirects off-topic |
| `[Chemistry]` | `CHEMISTRY_SYSTEM` | Chemistry only — redirects off-topic |
| `[Biology]` | `BIOLOGY_SYSTEM` | Biology only — redirects off-topic |
| `[Maths]` / `[Mathematics]` / `[Real Numbers]` | `MATHS_SYSTEM` | All Class 10 Maths chapters |
| `[Mental Health]` or no recognised prefix | `GENERAL_SYSTEM` | Academic + mental health support |

The `netlify/functions/` directory is legacy — ignore it.

## Images

All image assets live in `images/`. Do NOT put images in the root.

| File | Usage |
|------|-------|
| `images/StudyEasemain.png` | Main wordmark logo — used in all sidebars and index.html navbar |
| `images/studyease-fav.png` | Favicon + apple-touch-icon across all pages; also used in splash/loading screens |
| `images/ailogo.png` | AI companion icon — loader, welcome screen, and chat avatars in ai.html |

Old root images (`favicon.png`, `logo.png`, `logo-sidebar.png`, `logo-icon.png`, `logo-white.png`) have been deleted.

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
| `settings.html` | User settings — account, appearance, subscription |

### Browser tab titles (standardised)

| Page | Title |
|------|-------|
| `index.html` | `StudyEase — AI-powered CBSE Board Prep` |
| `dashboard.html` | `Dashboard — StudyEase` |
| `ai.html` | `AI Companion — StudyEase` |
| `maths.html` | `Mathematics — StudyEase` |
| `physics.html` | `Physics — StudyEase` |
| `chemistry.html` | `Chemistry — StudyEase` |
| `biology.html` | `Biology — StudyEase` |
| `progress.html` | `My Progress — StudyEase` |
| `quiz.html` | `Quiz — StudyEase` |
| `settings.html` | `Settings — StudyEase` |
| `breathing.html` | `Mindfulness — StudyEase` |
| `video-player.html` | `Real Numbers — StudyEase` |
| `video-player-ch2.html` | `Polynomials — StudyEase` |
| `session-player.html` | `Session · Real Numbers — StudyEase` |
| `session-player-ch2.html` | `Session · Polynomials — StudyEase` |

## Supabase Schema

All tables have RLS enabled. Users can only access their own rows.

### `profiles`
User profiles. Columns: `id`, `plan`, `class`, `name` (text), `avatar_url` (text — base64 JPEG, 200×200), `onboarding_done` (boolean, default false).

### `scores`
Quiz/session scores. Columns: `id`, `user_id`, `chapter`, `correct`, `total`, `pct`, `early`, `created_at`.

### `chat_history`
AI conversation history. Columns: `id` (uuid), `user_id` (uuid FK), `user_message` (text), `ai_reply` (text), `subject` (text), `created_at` (timestamptz).

Subject values saved per page:
- `ai.html` → dynamic (e.g. `"Physics"`, `"Maths"`, `"Mental Health"`, `"General"`)
- `physics.html` → `"Physics"`
- `chemistry.html` → `"Chemistry"`
- `biology.html` → `"Biology"`
- `maths.html` → `"Maths"`
- `video-player.html` / `session-player.html` → `"Maths"`
- `video-player-ch2.html` / `session-player-ch2.html` → `"Maths"`

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

## Sidebar Logo (all sidebar pages)

Every page with a sidebar has this logo HTML:

```html
<div class="sb-logo">
  <a href="#" onclick="handleLogoClick(event)" style="display:block;cursor:pointer">
    <img src="images/StudyEasemain.png" alt="StudyEase" style="height:32px;width:auto;object-fit:contain;max-width:160px"/>
  </a>
</div>
```

And this global function before `</body>`:

```javascript
function handleLogoClick(e){
  e.preventDefault();
  window.supabase.createClient(
    'https://xiwrvbtryeesfgeydxnf.supabase.co',
    '<anon_key>'
  ).auth.getSession().then(function(r){
    window.location.href=(r.data&&r.data.session)?'dashboard.html':'index.html';
  });
}
```

The logo click is **smart** — redirects to dashboard if logged in, landing page if not. Pages with sidebars: `dashboard.html`, `maths.html`, `physics.html`, `chemistry.html`, `biology.html`, `progress.html`, `quiz.html`, `settings.html`, `ai.html`, `video-player.html`, `video-player-ch2.html`.

## Splash / Loading Screens

### index.html — branded splash for returning users
When the auth check finds an existing session, before redirecting to dashboard, a 2-second splash screen is shown:
- White full-screen overlay (z-index:99999)
- Pulsing `images/studyease-fav.png` (72px) + `images/StudyEasemain.png` (28px, 70% opacity) below it
- CSS animation: `@keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`
- After 2s, fades out (opacity 0, 0.4s) then redirects
- If NO session: homepage fades in normally — no splash shown

### dashboard.html — onboarding loading screen
After onboarding completes (`obFinish()`):
- Sets `localStorage.setItem('studyease_just_onboarded', 'true')`
- Shows `showLoadingScreen()`: white overlay with pulsing `images/studyease-fav.png` (64px)
- `@keyframes favPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`
- After 2s fade-out, clears the localStorage flag
- On any subsequent dashboard page load, if `studyease_just_onboarded === 'true'` is in localStorage, the same screen plays once and clears

## AI on Each Page

All pages that call the Edge Function:
1. Include `Authorization: Bearer <anon_key>` in the fetch headers
2. Wrap the post-response Supabase insert in `try{...}catch(e){}` and use `.then(null, function(){})` instead of `.catch(function(){})` — calling `.catch()` directly on a `PostgrestFilterBuilder` can throw synchronously in some supabase-js v2 CDN builds

### ai.html (General AI companion)
- Full ChatGPT-style interface with left sidebar showing conversation history
- Conversations grouped by: subject change OR 1-hour time gap (whichever comes first)
- Subject filter tabs at top — prefixes message with `[Subject]` when selected (General tab = no prefix)
- History loaded from `chat_history` table on auth
- Sidebar shows Today / Yesterday / day-of-week groupings with delete buttons
- View-only mode when clicking past conversations
- **Privacy button**: shows open-lock SVG in normal mode, closed-lock SVG in private mode; `lock-snap` CSS animation when locking, `unlock-bounce` when unlocking — no external files, pure CSS keyframes
- **Mental Health Counsellor mode**: open `ai.html?mode=counsellor` to enter counsellor mode — sets `subject='Mental Health'`, removes active tab, auto-shows a welcome bubble. URL param is cleaned with `window.history.replaceState` after reading.
- **Mental Health sidebar highlight**: conversations with `subject === 'Mental Health'` get class `conv-item--mental` (purple left border) and a `💙 Mental Health` subject chip styled with `.conv-subj--mental`

#### ai.html — Logo / Avatars
- **Loader** (`#loader .l-mark`): shows `images/ailogo.png` (80px, border-radius:16px, pulsing) while auth check runs
- **Welcome/empty state** (`#empty-state`): `images/ailogo.png` with `aiPulse` animation (2s), "StudyEase AI" bold title, subtitle below
- **AI chat bubbles**: `getAIAvatarEl()` returns `<img src="images/ailogo.png" style="border-radius:8px">` (rounded square, NOT circle)
- **User chat bubbles**: `getUserAvatarEl()` returns profile photo (`profiles.avatar_url`) if set, else initials in blue circle (`border-radius:50%`)
- `userAvatarUrl` and `userInitial` are set in the auth handler; profile is fetched from `profiles` table on login

#### ai.html — Voice Dictation
- Uses `SpeechRecognition` / `webkitSpeechRecognition`
- `continuous=true`, `interimResults=true` — keeps listening through natural pauses
- Reads only new results from `e.resultIndex` (NOT `e.results[0]`) — prevents duplication
- Only appends `isFinal` results to the input
- **Auto-stops after 2 seconds of silence** via `silenceTimer` — timer resets on every new result, fires `recog.stop()` after 2000ms of quiet
- Clicking the mic button again stops immediately (`clearTimeout(silenceTimer); recog.stop()`)

### Subject pages (physics / chemistry / biology / maths)
- Floating "Ask AI" widget (bottom-right FAB button)
- Prefixes message with `[SubjectName]` before sending to Edge Function
- Saves to `chat_history` with correct subject field
- Uses `window._sb` (Supabase client) and `window._userId` set on each page
- AI is **subject-restricted**: PHYSICS_SYSTEM only answers Physics, etc. Off-topic questions are redirected.

### video-player.html + video-player-ch2.html
- Controls bar has an "Ask AI" button (`c-btn--ai`) that toggles `#vp-popup` via `toggleAI()`
- **Real API calls** — uses the Supabase Edge Function (NOT hardcoded answers)
- Ch1 prefixes with `[Real Numbers]`, Ch2 prefixes with `[Maths]` → both route to `MATHS_SYSTEM` (all chapters)
- Maintains `aiHistory` array (last 20 messages) for conversation context
- Saves to `chat_history` with `subject:'Maths'`
- **`#vp-popup` is a direct child of `#player-wrap`** (not body) — this keeps it visible during fullscreen. `position:fixed` escapes `overflow:hidden` and in fullscreen is relative to the fullscreen viewport. Do NOT move it back to body.
- `handleFsPopup()` is intentionally a no-op — no DOM movement needed.
- Topbar logo uses `filter:brightness(0) invert(1)` to appear white on the dark player background

### session-player.html + session-player-ch2.html
- Fullscreen black video player — no sidebar, no topbar
- Floating purple FAB (bottom-right) opens a 340px popup chat panel
- FAB **automatically hides** when a poll overlay or ready-prompt is showing, reappears after
- Uses same real API pattern with chapter prefix (`[Real Numbers]` / `[Maths]`) → `MATHS_SYSTEM`
- Saves to `chat_history` with `subject:'Maths'` using `window._SB` and `window._sessUid`
- Poll/ready hiding implemented via classList.add/remove patching on `#ready-prompt` and `#poll-overlay`
- Topbar logo uses `filter:brightness(0) invert(1)` to appear white on the dark session background

## Dashboard

### Topbar
- **Left**: hamburger menu button only (mobile)
- **Centre**: live clock — `HH:MM AM/PM` (bold navy, ticks every second via `setInterval`) + day + full date below it. Uses `position:absolute; left:50%; transform:translateX(-50%)` so it stays truly centred regardless of left/right content
- **Right**: notification bell + avatar button
- **Removed**: greeting text, search bar — do NOT re-add these

### Welcome card
- Shows greeting (`welcome-hi`: "Good afternoon, Iesha! 👋") and one-line subtitle (`welcome-sub`: class + "Ready to study smarter today?")
- **No badges** — the AI message counter and streak pill have been removed. Do NOT re-add them.

### AI CTA card
- Large dark navy banner linking to `ai.html`
- Icon: `images/ailogo.png` (38px, border-radius:10px) — replaced the old chat bubble SVG
- Title: "Ask AI a Doubt" · Subtitle: "Get instant answers, explained clearly"

### Subject cards
- Four cards: Physics ⚡, Chemistry ⚗️, Biology 🌿, Mathematics 📐
- Each shows: emoji + subject name + "Class 10" subtitle + arrow
- **No tags** (Videos/Practice/Notes chips removed) — do NOT re-add them

### My Progress card
Simplified: "My Progress" title + "View all →" link. Entire card links to `progress.html`.

### Mental Health Check-in card
- Title: "How are you feeling?" (simplified — do NOT change back to longer version)
- Four mood buttons: 😊 Great / 😐 Okay / 😟 Stressed / 😔 Struggling
- On tap: shows a tailored tip + two CTAs: **🧘 Try mindfulness** → `breathing.html` and **💜 AI Counsellor** → `ai.html?mode=counsellor`
- Mood saved to **localStorage** (`se_mood` key: `{mood, date}`) AND **Supabase** (`mood_checkins` table, type='mood')
- `currentUserId` stored from `onAuthStateChange` — never use `getSession()` inside handlers
- On page load: if today's mood in localStorage, restores without re-saving (`skipSave=true`)

### Sidebar
Links: Dashboard, My Progress, AI Companion (→ ai.html), Physics, Chemistry, Biology, Mathematics, Breathing, Settings.
**Removed:** Practice Questions, Past Papers, Flashcards, NCERT Notes — do not re-add.

### Notification bell (topbar)
- `id="notif-btn"` · `#notif-popup`: 320px, 2 static notifications + "Mark all as read"
- Positioned via `position:relative` on `.topbar-r` · closes on outside click or Escape

### Avatar popup (topbar)
- `#avatar-popup`: 280px, name/email/plan badge + Settings link + Sign out
- Populated in auth handler and `loadUserProfile()` · closes on outside click or Escape

### Onboarding modal
- Shown ONLY when account is < 2 minutes old AND `!onboarding_done`
- 3 steps: Name → Class (4 pill buttons, auto-advances) → Photo upload (optional)
- On finish (`obFinish()`): upserts to `profiles`, then shows the 2-second loading screen
- Network error on profile load: silently fails, does NOT show onboarding

## Mindfulness Page (breathing.html)

Standalone page — **no login required** to use, but saves to DB if logged in.
Top bar has `images/StudyEasemain.png` logo (white-filtered for dark background).

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

**ai.html sizing**: header 62px tall, subject pills `6px 16px` padding / `0.86rem`, message text `1rem`, bubbles `13px 18px` padding, input `1rem`, send button `40px`, chat max-width `760px`.

## Key Deployment Notes

- After pushing to `main`, GitHub Pages redeploys in ~1–2 minutes.
- The `netlify.toml` and `netlify/functions/` directory are legacy — ignore them.
- To update the Edge Function: edit `supabase/functions/ai-chat/index.ts` and run `supabase functions deploy ai-chat --project-ref xiwrvbtryeesfgeydxnf`
- The Supabase anon key is hardcoded in every HTML file — intentional for a pure-frontend app with RLS enabled.
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpd3J2YnRyeWVlc2ZnZXlkeG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTQ0NDAsImV4cCI6MjA5NDU5MDQ0MH0.3Sp9dlc8cNsrzdHAGy74pCqscjL1MFV9ZWMW90QbhqE`

## settings.html

Full settings page with sidebar layout. Sections:
- **Account:** Profile photo upload (canvas crop to 200×200, base64 saved to `profiles.avatar_url`), display name (saves to `profiles.name`), email (read-only), class dropdown (saves to `profiles.class`)
- **Appearance:** Font size Normal / Large (localStorage key `se_fontsize`; Large sets `document.documentElement.style.fontSize = '17px'`)
- **Subscription:** Shows current plan, "Upgrade to Achiever" placeholder button (alert only)
- **Danger zone:** Sign out + Delete account (both just sign out for now)

## Maths page — Flashcards tab

`maths.html` has tabs: Videos | **Flashcards** | Quiz | Notes (Practice tab was removed).
- Flashcards tab (`#tab-flashcards`) shows `#flashcards-ch1` or `#flashcards-ch2` based on active chapter
- Ch3+ shows `#flashcards-coming` ("Flashcards coming soon")
- Each chapter has 8 flip cards in a 2-column grid (`.fc-grid`)
- Card flip: click toggles `.flipped` class → CSS `rotateY(180deg)` with `backface-visibility:hidden`
- `selectChapter()` JS function updates both video sections AND flashcard sections

## Profile persistence

- All pages load `profiles.name` and `profiles.avatar_url` after auth and display them in topbar/sidebar avatars
- If `avatar_url` exists: set `backgroundImage`, `backgroundSize:cover`, clear `textContent`
- If not: show initials as before
- `dashboard.html` has `loadUserProfile()`, `setAvatarDisplay()`, `updateAvatarEl()` helper functions
- `ai.html` fetches `profiles.avatar_url` and `profiles.name` on login and uses them for the user message avatar (`getUserAvatarEl()`)

## Known Gotchas

- **Never use `getSession()` inside event handlers to get the user ID** — it can return null due to timing. Always store `currentUserId` from `onAuthStateChange` and reference it directly.
- **Supabase upsert errors are NOT thrown** — they're in `res.error`. Always use `.then(function(res){ if(res.error) console.error(...) })` not just `.catch()`.
- **All Edge Function fetch calls must include the Authorization header** — `'Authorization':'Bearer <anon_key>'`. Without it the function returns `UNAUTHORIZED_NO_AUTH_HEADER` and `d.reply` is undefined, showing "Sorry, something went wrong."
- **Do NOT call `.catch()` directly on a `PostgrestFilterBuilder`** — it can throw a synchronous TypeError in some supabase-js v2 CDN builds, which propagates to the fetch chain's `.catch` and shows a false "Network error." Always use `.then(null, function(){})` instead and wrap in `try-catch`.
- **`groupConversations` in ai.html** splits on subject change OR time gap — both conditions. This ensures subject-page chats (Physics, Maths, etc.) always appear as separate sidebar entries.
- **breathing.html saves to `mood_checkins`**, not a separate table. The `mood` column is nullable for breathing/meditation rows.
- The `mood_checkins` unique constraint `(user_id, date)` only applies to upserts from the dashboard mood check-in. Breathing/meditation sessions use plain insert (multiple per day is fine).
- **`#vp-popup` must stay inside `#player-wrap`** — moving it to body breaks fullscreen visibility. `position:fixed` inside a non-transformed element escapes `overflow:hidden` correctly.
- **Onboarding only triggers for truly new accounts** — check `created_at` age, not just `onboarding_done`. Existing users whose `onboarding_done` is null (column added later) must NOT see the modal.
- **`ai.html?mode=counsellor` sets `subject='Mental Health'`** — messages are sent with prefix `[Mental Health]` which falls through to `GENERAL_SYSTEM` (correct). The URL param is consumed once via `window.history.replaceState`.
- **Logo images on dark backgrounds** (session players, video player topbar, breathing.html top logo) use `filter:brightness(0) invert(1)` to render white — the PNG is full-colour so the filter is required.
- **Voice dictation duplication fix** — NEVER read `e.results[0]` in the `onresult` handler. Always iterate from `e.resultIndex` to avoid replaying already-appended results on each subsequent event.
- **`studyease_just_onboarded` localStorage flag** — set by `obFinish()` in dashboard.html, cleared after the loading screen plays. If you see the loading screen appearing unexpectedly on dashboard load, this flag is still in localStorage.

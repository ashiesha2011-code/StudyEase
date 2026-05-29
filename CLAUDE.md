# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step — open any HTML file directly or use a simple server:

```bash
python3 -m http.server 3000
# visit http://localhost:3000
```

## Architecture

**Pure HTML/JS, no framework, no bundler.** Every page is a self-contained HTML file with all CSS and JS written inline. There is no shared stylesheet or JS module — each file is independent.

**Stack:**
- Frontend: plain HTML files, all styles and scripts inline per page
- Auth + DB: Supabase (project ref: `xiwrvbtryeesfgeydxnf`)
- AI: Claude Haiku via a Supabase Edge Function (`supabase/functions/ai-chat/index.ts`)
- Hosting: GitHub Pages at `https://ashiesha2011-code.github.io/StudyEase/`

**AI flow:**
All AI calls across every page go to `https://xiwrvbtryeesfgeydxnf.supabase.co/functions/v1/ai-chat`. The Edge Function requires JWT verification to be **disabled** in the Supabase dashboard (it's already set this way). The `ANTHROPIC_API_KEY` is stored as a Supabase Edge Function secret. The Edge Function file at `netlify/functions/ai-chat.js` is unused — the active function is the Supabase one.

**Supabase schema:**
- `profiles` — user profiles
- `scores` — quiz/session scores  
- `chat_history` — columns: `id` (uuid), `user_id` (uuid FK), `user_message` (text), `ai_reply` (text), `subject` (text), `created_at` (timestamptz). RLS enabled.

**Chat history sidebar (ai.html):**
Conversations are grouped from flat `chat_history` rows by a 1-hour gap heuristic — rows within 1 hour of each other are treated as one conversation. The sidebar shows them grouped by Today / Yesterday / day name. Clicking a conversation opens it in view-only mode; "New Chat" clears back to the empty state.

**Dashboard → ai.html handoff:**
When the user has chatted in the dashboard AI card and clicks "Open full chat →", the card's `chatHistory` array and `displayMessages` array are saved to `sessionStorage` under the key `se_dash_conv`. `ai.html` reads and clears this on load to restore the conversation.

**Subject pages (physics/chemistry/biology/maths):**
Each has a floating "Ask AI" widget. It prefixes the user message with `[SubjectName]` before sending to the Edge Function. It saves to `chat_history` using `window._sb` and `window._userId` which are set on each subject page.

## Brand / Design Tokens

| Token | Value |
|-------|-------|
| Primary navy | `#0A1628` |
| Accent blue | `#3B82F6` |
| Success | `#10B981` |
| Font | DM Sans (via Google Fonts) |
| Border radius | 12px (card), 14px (input) |

Theme system: `ai.html` and `dashboard.html` support light / dark / device themes via `data-theme` attribute on `<html>` and CSS custom properties in `:root`, stored in `localStorage` as `se-ai-theme`.

## Key Deployment Notes

- After pushing to `main`, GitHub Pages redeploys in ~1–2 minutes.
- The `netlify.toml` and `netlify/functions/` directory are legacy — ignore them.
- To update the Edge Function, edit `supabase/functions/ai-chat/index.ts` and redeploy via the Supabase dashboard (Edge Functions → ai-chat → Editor).
- The Supabase anon key is hardcoded in every HTML file — this is intentional for a pure-frontend app with RLS enabled.

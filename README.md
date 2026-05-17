# StudyEase 📚

> AI-powered CBSE board exam preparation for every Indian student.

**India's first AI study companion that actually remembers you** — your weak topics, your mistakes, your exam pressure — and gets more personalised the longer you use it.

---

## 🗂 Repository Structure

```
studyease/
├── index.html          ← Homepage (this file)
├── css/
│   └── style.css       ← Global stylesheet (used across all pages)
├── js/                 ← (future: shared utility scripts if needed)
└── assets/             ← (future: images, icons, fonts)
```

> **Note:** All page-specific JavaScript is written inline inside each HTML file's `<script>` tag. The `css/style.css` file is the single shared stylesheet for all pages.

---

## 📄 Pages

| File | Description | Status |
|------|-------------|--------|
| `index.html` | Homepage — hero, features, pricing, testimonials | ✅ Done |
| `dashboard.html` | Student dashboard | 🔜 Next |
| `notes.html` | NCERT Notes with Selection-to-Chat | 🔜 Planned |
| `practice.html` | Practice questions & mock tests | 🔜 Planned |
| `profile.html` | Weak topic tracker & settings | 🔜 Planned |

---

## 🎨 Brand

| Token | Value |
|-------|-------|
| Primary / Navy | `#0A1628` |
| Accent / Blue | `#3B82F6` |
| Success / Emerald | `#10B981` |
| Font | DM Sans + Lora |
| Border radius | 12px (card), 20px (large), 32px (modal) |

---

## 💰 Plans

| Plan | Price | Key Feature |
|------|-------|-------------|
| **Free** | ₹0 | 50 AI messages/month, mental health check-in |
| **Achiever** | ₹99/month | Unlimited AI, board examiner intelligence |
| **Scholar** | ₹199/month | Root cause analyser, parent dashboard |

> 💙 Mental health weekly check-in is included on **every plan**.

---

## 🚀 Running Locally

Just open `index.html` in your browser — no build tools, no npm, no setup.

```bash
# Option 1: Direct
open index.html

# Option 2: Simple server (Python)
python3 -m http.server 3000
# Then visit http://localhost:3000
```

---

## 🔧 Tech Stack (Frontend)

- Pure HTML5, CSS3, JavaScript (no frameworks)
- Google Fonts: DM Sans + Lora
- Backend planned: Node.js + Supabase + Claude API + Razorpay

---

## ✏️ Editing Guide

**To change plan prices:** Search for `₹99` or `₹199` in `index.html`.

**To change colours:** Edit the `:root` variables at the top of `css/style.css`.

**To add a new page:** Copy the navbar + footer from `index.html`, link `css/style.css`, and add your page content.

**To change the auto-popup timing:** Find `setTimeout` in `index.html` and change `10000` (milliseconds).

---

Built by **Uthkarsh** · [Zenith Space](https://zenithspace.org) · 2025

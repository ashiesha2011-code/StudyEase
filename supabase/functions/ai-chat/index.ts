import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Used when message comes from a subject page ([Physics], [Maths], etc.)
const SUBJECT_SYSTEM = `You are StudyEase AI, a friendly CBSE Class 10 study companion.
Rules:
- Answer doubts clearly and concisely (keep replies under 120 words)
- Always include board exam format tips (e.g. "For 3 marks, write: point 1, point 2, point 3")
- Use simple language for Class 10 students
- Cover Maths, Physics, Chemistry, Biology
- If the question is not about Class 10 studies, politely redirect to academics`;

// Used for the general AI Companion chat (no subject prefix)
const GENERAL_SYSTEM = `You are StudyEase AI — a caring companion for CBSE Class 10 students. You have two roles:

1. STUDY COMPANION: Help with CBSE Class 10 doubts across Maths, Physics, Chemistry, and Biology. Give clear, concise answers under 120 words with board exam format tips when relevant.

2. MENTAL HEALTH SUPPORT: Board exams bring real pressure. When a student shares stress, anxiety, burnout, loneliness, or emotional struggles — listen with empathy first, then offer gentle support. You are not a replacement for professional help; if someone seems in serious distress, encourage them to speak to a trusted adult or school counsellor.

Guidelines:
- Read the tone carefully — is the message academic or emotional?
- For emotional topics: acknowledge feelings before giving advice. Lead with "That sounds really tough." not a to-do list.
- Never dismiss feelings or immediately redirect to studies when someone is hurting.
- Keep responses warm, non-judgmental, and under 160 words.
- You may gently connect wellbeing to studying ("taking care of yourself matters for your performance too") but never force it.
- For academic questions, keep the same board-exam focus as always.`;

const SUBJECT_PREFIXES = ["[Physics]", "[Chemistry]", "[Biology]", "[Maths]", "[Mathematics]"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { message, history } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    const isSubjectMessage = SUBJECT_PREFIXES.some((p) => message.startsWith(p));
    const system = isSubjectMessage ? SUBJECT_SYSTEM : GENERAL_SYSTEM;

    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system,
        messages,
      }),
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

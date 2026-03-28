import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RequestBody = {
  prompt: string;
  blacklist?: string[];
};

function extractJsonObject(text: string): unknown | null {
  // Try plain JSON first.
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }

  // Then try fenced JSON: ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1] ?? text;

  try {
    return JSON.parse(candidate);
  } catch {
    // Best-effort extraction of a single top-level object.
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objMatch) return null;
    try {
      return JSON.parse(objMatch[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing in environment." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const prompt = body?.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
    }

    const blacklist = (body?.blacklist ?? []).filter(Boolean).slice(0, 30);

    // Require auth so we don't expose your OpenRouter key to anonymous traffic.
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const systemPrompt =
      "You are a game recommendation assistant. The user will describe what kind of game they want. " +
      "Return ONLY valid JSON (no markdown) with the following schema: " +
      "{ \"answer\": string, \"game\": { \"title\": string, \"genre\": string, \"reason\": string } }. " +
      "Keep answer <= 2 sentences and reason <= 2 sentences. " +
      "If the user asks for board games and/or tabletop, prefer board/tabletop games. " +
      "Avoid suggesting any game titles that appear in blacklist.";

    const userPrompt =
      `User request: ${prompt}\n` +
      (blacklist.length ? `Blacklist (avoid): ${blacklist.join(", ")}\n` : "") +
      "Suggest ONE game to play next.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // OpenRouter uses OpenAI-compatible params.
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const raw: unknown = await response.json();
    if (!response.ok) {
      const rawError = raw as { error?: { message?: unknown } };
      return NextResponse.json(
        {
          error:
            typeof rawError?.error?.message === "string"
              ? rawError.error.message
              : "OpenRouter request failed."
        },
        { status: 500 }
      );
    }

    type OpenRouterChatChoice = {
      message?: { content?: unknown };
      text?: unknown;
    };
    const rawChat = raw as { choices?: OpenRouterChatChoice[] };
    const contentRaw =
      rawChat?.choices?.[0]?.message?.content ?? rawChat?.choices?.[0]?.text;
    const content = typeof contentRaw === "string" ? contentRaw : "";

    const parsed = extractJsonObject(typeof content === "string" ? content : "");
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { error: "Could not parse LLM response." },
        { status: 500 }
      );
    }

    const result = parsed as {
      answer?: unknown;
      game?: { title?: unknown; genre?: unknown; reason?: unknown };
    };

    if (typeof result.answer !== "string") {
      return NextResponse.json(
        { error: "LLM response missing 'answer'." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer: result.answer,
      game: result.game?.title && typeof result.game.title === "string"
        ? {
            title: result.game.title,
            genre: typeof result.game.genre === "string" ? result.game.genre : undefined,
            reason: typeof result.game.reason === "string" ? result.game.reason : undefined
          }
        : undefined
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


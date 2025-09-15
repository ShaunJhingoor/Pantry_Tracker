// api/analyze.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res.status(405).send("Method Not Allowed");

    // 1) Parse body safely (Vercel may pass string)
    const rawBody = (req as any).body;
    let body: any = rawBody;
    if (typeof rawBody === "string") {
      try {
        body = JSON.parse(rawBody);
      } catch {
        /* ignore */
      }
    }
    const imageUrl: string | undefined = body?.imageUrl;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

    // 2) Sanity check env var
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY in environment");
      return res
        .status(500)
        .json({ error: "Server misconfig: missing OPENAI_API_KEY" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 3) Build message content: support data URLs AND https URLs
    const isDataUrl = imageUrl.startsWith("data:image/");
    const content: any[] = [
      {
        type: "text",
        text:
          "Analyze this pantry/food product image and return ONLY valid JSON with keys: " +
          '{"name":"","expiration":"","quantity":"","unit":""} ' +
          "If a field is unknown, use an empty string. Dates MM/DD/YYYY, quantity numeric string, unit like g, oz, ml, L.",
      },
      isDataUrl
        ? { type: "image_url", image_url: { url: imageUrl } } // base64 data URL
        : { type: "image_url", image_url: { url: imageUrl } }, // public https URL
    ];

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
      max_tokens: 300,
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e, "raw:", raw);
    }

    return res.status(200).json({
      name: typeof parsed.name === "string" ? parsed.name : "",
      expiration:
        typeof parsed.expiration === "string" ? parsed.expiration : "",
      quantity:
        typeof parsed.quantity === "string" ||
        typeof parsed.quantity === "number"
          ? String(parsed.quantity)
          : "",
      unit: typeof parsed.unit === "string" ? parsed.unit : "",
    });
  } catch (e: any) {
    // 4) Show real error in both logs and response during debugging
    console.error("Analyze failed:", e?.response?.data || e?.message || e);
    return res.status(500).json({
      error: "Analyze failed",
      details: e?.response?.data || e?.message || String(e),
    });
  }
}

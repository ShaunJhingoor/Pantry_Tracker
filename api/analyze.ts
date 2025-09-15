// api/analyze.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res.status(405).send("Method Not Allowed");

    const { imageUrl } = (req.body as { imageUrl?: string }) ?? {};
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const prompt =
      "Analyze this pantry/food product image and return ONLY valid JSON with keys: " +
      '{"name":"","expiration":"","quantity":"","unit":""} ' +
      "If a field is unknown, use an empty string. Dates MM/DD/YYYY, quantity numeric string, unit like g, oz, ml, L.";

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const raw = resp.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {}

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
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Analyze failed" });
  }
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// Style vocabulary the model must choose from (keeps results consistent with the
// furniture agent + the UI's style chips).
const STYLE_VOCAB = [
  "minimalist", "japandi", "scandinavian", "boho", "cottagecore", "mid-century",
  "modern", "industrial", "coastal", "dark academia", "maximalist", "cozy",
  "aesthetic", "vintage",
];

type ImageInput = { data: string; media_type: string };

const REPORT_TOOL = {
  name: "report_styles",
  description: "Report the interior-design styles detected across the uploaded inspiration images.",
  input_schema: {
    type: "object" as const,
    properties: {
      styles: {
        type: "array",
        description: "1–4 styles, most prominent first, chosen from the allowed list.",
        items: { type: "string", enum: STYLE_VOCAB },
      },
    },
    required: ["styles"],
    additionalProperties: false,
  },
};

export async function POST(req: NextRequest) {
  const { images } = (await req.json()) as { images?: ImageInput[] };

  if (!process.env.ANTHROPIC_API_KEY) {
    // No key — let the client fall back to manually-selected styles.
    return NextResponse.json({ styles: [], source: "none" });
  }
  if (!images || images.length === 0) {
    return NextResponse.json({ styles: [], source: "empty" });
  }

  try {
    const client = new Anthropic();
    const imageBlocks = images.slice(0, 6).map((img) => ({
      type: "image" as const,
      source: { type: "base64" as const, media_type: img.media_type as "image/jpeg", data: img.data },
    }));

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: "report_styles" },
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: "These are interior-design / room inspiration images a college student saved. Identify the 1–4 dominant aesthetics from the allowed list and report them via report_styles, most prominent first.",
            },
          ],
        },
      ],
    });

    const call = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "report_styles",
    );
    const raw = (call?.input as { styles?: string[] } | undefined)?.styles ?? [];
    const styles = raw.filter((s) => STYLE_VOCAB.includes(s)).slice(0, 4);
    return NextResponse.json({ styles, source: "ai" });
  } catch (err) {
    console.error("[analyze-style] failed:", err);
    return NextResponse.json({ styles: [], source: "error" });
  }
}

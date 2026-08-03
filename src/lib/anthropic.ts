import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a clinical lab assistant helping a lab scientist draft a remark for a
test result. You are NOT diagnosing a patient and you are NOT writing a
final report - you are producing a short, cautious DRAFT suggestion that a
qualified lab professional will review, edit, and approve (or reject)
before it goes anywhere near a patient record.

Rules:
- 2-4 sentences maximum.
- Only comment on the specific values provided and their reference ranges.
  Never invent values, patient history, or symptoms that weren't given.
- Use hedged, descriptive language ("is within normal limits", "is above
  the reference range", "may warrant clinical correlation") - never
  definitive diagnostic language ("this indicates", "the patient has",
  "diagnosis:").
- If every value is within range, say so plainly and briefly.
- Do not include any disclaimer text, headers, or preamble like "Here is a
  draft:" - return only the remark itself, ready to drop into a text box.`;

export interface RemarkParameter {
  name: string;
  value: string;
  unit?: string;
  range?: string;
}

/**
 * Best-effort draft only - callers must treat the return value as
 * editable/rejectable, never auto-saved. Throws on any failure (missing
 * key, API error) so the route can surface a clear error rather than
 * silently returning something misleading.
 */
export async function generateResultRemark(
  testTitle: string,
  parameters: RemarkParameter[]
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI assistance is not configured on this server.");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const parameterLines = parameters
    .map((p) => `- ${p.name}: ${p.value}${p.unit ? ` ${p.unit}` : ""}${p.range ? ` (reference range: ${p.range})` : ""}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Test: ${testTitle}\n\nResults:\n${parameterLines}\n\nDraft a brief remark.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI did not return a usable suggestion.");
  }

  return textBlock.text.trim();
}

import { useState } from "react";

export function useCommentParser() {
  const [parsing, setParsing] = useState(false);

  async function parseComment(text) {
    setParsing(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `You are an assistant for a Bangladeshi Facebook seller. Extract order info from Messenger comments. Return ONLY valid JSON with these fields: customer, phone, address, product, amount. If a field is not found, use empty string. No explanation, no markdown, just JSON.`,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return null;
    } finally {
      setParsing(false);
    }
  }

  return { parseComment, parsing };
}

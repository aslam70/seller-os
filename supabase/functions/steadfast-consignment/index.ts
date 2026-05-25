import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.json();

  const response = await fetch("https://portal.packzy.com/api/v1/create_order", {
    method: "POST",
    headers: {
      "Api-Key": Deno.env.get("STEADFAST_API_KEY") ?? "",
      "Secret-Key": Deno.env.get("STEADFAST_SECRET_KEY") ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});

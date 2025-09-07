export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const { prompt, licenseKey } = body || {};

  // (Optional) Validate license via your provider (Stripe server, LemonSqueezy, Gumroad, etc.)
  // For MVP you can skip or use a hardcoded allowlist.
  if (process.env.REQUIRE_LICENSE === 'true') {
    if (!licenseKey || licenseKey.length < 8) return new Response("Invalid license", { status: 401 });
    // TODO: Verify licenseKey with your licensing provider here
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Missing OPENAI_API_KEY", { status: 500 });

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a business data analyst. Be concise, numeric, and actionable." },
      { role: "user", content: prompt || "Provide a concise business summary." }
    ],
    temperature: 0.2
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(`Upstream error ${resp.status}: ${text}`, { status: 500 });
  }

  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content || "";
  return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" }});
}

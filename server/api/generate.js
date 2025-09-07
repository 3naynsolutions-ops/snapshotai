export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // preflight OK (no body)
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { prompt } = req.body || {};

  // Call OpenAI
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise, numeric, actionable business data analyst.' },
        { role: 'user', content: prompt || 'Provide a concise business summary.' }
      ],
      temperature: 0.2
    })
  });

  if (!r.ok) {
    const text = await r.text();
    return res.status(500).json({ error: `Upstream error ${r.status}: ${text}` });
  }
  const json = await r.json();
  const text = json?.choices?.[0]?.message?.content || '';
  return res.status(200).json({ text });
}

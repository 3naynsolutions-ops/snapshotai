export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { prompt } = req.body || {};

  // Call OpenAI using your server-side env var
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
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

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(500).json({ error: `Upstream error ${resp.status}: ${text}` });
  }

  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content || '';
  return res.status(200).json({ text });
}

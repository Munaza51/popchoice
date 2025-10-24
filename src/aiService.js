export async function getMovieRecommendation(userText, movies) {
  const API_KEY = 'YOUR_OPENROUTER_API_KEY'; // Replace with your key

  const prompt = `
You are a friendly movie recommender. 
User preferences: ${userText}
Movies:
${movies.map(m => `- ${m.title} (${m.releaseYear}): ${m.content}`).join('\n')}
Choose the best match based on the preferences and provide a short 1-2 sentence explanation why.
Return ONLY the movie title and explanation in JSON format: { "title": "...", "explanation": "..." }
`;

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a professional movie recommender.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 150
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse AI response. Check your API key or prompt.');
  }
}

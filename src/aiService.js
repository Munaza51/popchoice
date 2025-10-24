export async function getMovieRecommendation(userText) {
  const API_KEY = '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'; 

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a friendly movie recommender. Output only recommendation and explanation.' },
      { role: 'user', content: `User preferences: ${userText}. Recommend the best matching movie from the list.` }
    ],
    temperature: 0.4,
    max_tokens: 256
  };

  try {
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
      console.error('Full response error:', err);
      throw new Error(err.error || `Request failed: ${res.status}`);
    }

    const data = await res.json();
    const recommendation = data?.choices?.[0]?.message?.content?.trim();

    if (!recommendation) throw new Error('Failed to parse AI response.');
    return recommendation;
  } catch (err) {
    console.error(err);
    throw new Error(err.message || 'AI service error.');
  }
}

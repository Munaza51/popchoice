import { openai, supabase } from './lib/api.js';
import MOVIES from './content.js';

const form = document.getElementById('movie-form');
const statusEl = document.getElementById('status');
const questionsView = document.getElementById('questions-view');
const resultView = document.getElementById('result-view');
const movieBox = document.getElementById('movie-box');
const submitBtn = document.getElementById('submit-btn');
const againBtn = document.getElementById('again');

function setStatus(t){ statusEl.innerText = t || ''; }

async function ensureMoviesExist() {
  setStatus('Checking movies in database...');
  const { data: rows, error } = await supabase.from('movies').select('*').limit(1);
  if (error) {
    console.error('Supabase read error:', error);
    setStatus('Error reading from Supabase. Check console.');
    return;
  }

  if (!rows || rows.length === 0) {
    setStatus('Seeding movie rows into Supabase (no embeddings yet)...');
    const inserts = MOVIES.map(m => ({
      title: m.title,
      release_year: m.releaseYear,
      content: m.content,
      embedding: null
    }));
    const { error: insErr } = await supabase.from('movies').insert(inserts);
    if (insErr) {
      console.error('Insert error:', insErr);
      setStatus('Error inserting movies. Check console.');
      return;
    }
    setStatus('Inserted movie rows. Generating embeddings now...');
  } else {
    setStatus('Movies already present. Ensuring embeddings...');
  }

  // fetch all rows
  const { data: allRows, error: fetchErr } = await supabase.from('movies').select('*');
  if (fetchErr) { console.error(fetchErr); setStatus('Error fetching rows'); return; }

  // for each row without embedding, generate & update
  for (let i=0;i<allRows.length;i++) {
    const row = allRows[i];
    if (!row.embedding || row.embedding.length === 0) {
      setStatus(`Generating embedding ${i+1}/${allRows.length}: ${row.title}`);
      try {
        const resp = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: `${row.title} (${row.release_year}): ${row.content}`
        });
        const emb = resp.data[0].embedding;
        // update row
        await supabase.from('movies').update({ embedding: emb }).eq('id', row.id);
      } catch (e) {
        console.error('Embedding error for', row.title, e);
        setStatus('Error creating embeddings. See console.');
        return;
      }
    }
  }

  setStatus('');
}

// small helper: cosine similarity
function cosineSim(a, b){
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){
    dot += a[i]*b[i];
    na += a[i]*a[i];
    nb += b[i]*b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

async function findBestMatch(userEmbedding) {
  const { data: rows, error } = await supabase.from('movies').select('*').not('embedding','is',null);
  if (error) { console.error(error); return null; }
  let best = null, bestScore = -Infinity;
  for (const r of rows) {
    const sim = cosineSim(userEmbedding, r.embedding);
    if (sim > bestScore) { bestScore = sim; best = { row: r, score: sim }; }
  }
  return best;
}

async function getExplanation(userText, movie) {
  try {
    const prompt = `User preferences: ${userText}
We matched the movie: ${movie.title} (${movie.release_year}).
Movie blurb: ${movie.content}
Provide a short, friendly 1-2 sentence explanation why this movie matches the user's answers.`;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a friendly movie recommender. Keep it concise and clear.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 80
    });
    return resp.choices[0].message.content.trim();
  } catch (e) {
    console.error('Explanation error', e);
    return 'We recommend this movie — explanation service is temporarily unavailable.';
  }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  submitBtn.disabled = true;
  setStatus('Thinking...');

  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value;
  const q3 = document.getElementById('q3').value;
  const userText = `Favorite: ${q1}. Mood: ${q2}. Tone: ${q3}.`;

  try {
    // 1) create embedding for user
    setStatus('Creating embedding for your answers...');
    const embResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userText
    });
    const userEmb = embResp.data[0].embedding;

    // 2) find best match locally by comparing embeddings
    setStatus('Searching for best match...');
    const best = await findBestMatch(userEmb);
    if (!best) {
      setStatus('No movies with embeddings found.');
      submitBtn.disabled = false;
      return;
    }

    // 3) get explanation from OpenAI
    setStatus('Generating friendly explanation...');
    const explanation = await getExplanation(userText, best.row);

    // 4) show result
    questionsView.style.display = 'none';
    resultView.style.display = 'block';
    movieBox.innerHTML = `
      <div class="movie-title">${best.row.title} (${best.row.release_year})</div>
      <div>${best.row.content}</div>
      <div class="explain"><strong>Why:</strong> ${explanation}</div>
      <div class="small">Similarity score: ${best.score.toFixed(3)}</div>
    `;
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('Error occurred — check console.');
  } finally {
    submitBtn.disabled = false;
  }
});

againBtn.addEventListener('click', () => {
  resultView.style.display = 'none';
  questionsView.style.display = 'block';
});
 
// Initialize on load
setStatus('Preparing app...');
ensureMoviesExist().then(()=> setStatus(''));

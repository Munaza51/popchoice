// src/index.js
import MOVIES from './content.js';
import { getMovieRecommendation } from './aiService.js';

const form = document.getElementById('movie-form');
const statusEl = document.getElementById('status');
const questionsView = document.getElementById('questions-view');
const resultView = document.getElementById('result-view');
const movieBox = document.getElementById('movie-box');
const submitBtn = document.getElementById('submit-btn');
const againBtn = document.getElementById('again');

function setStatus(t) { statusEl.innerText = t || ''; }

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  submitBtn.disabled = true;

  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value;
  const q3 = document.getElementById('q3').value;
  const userText = `Favorite: ${q1}. Mood: ${q2}. Tone: ${q3}.`;

  setStatus('Thinking...');

  try {
    const rec = await getMovieRecommendation(userText, MOVIES);

    questionsView.style.display = 'none';
    resultView.style.display = 'block';
    movieBox.innerHTML = `
      <div class="movie-title">${rec.title}</div>
      <div class="explain">${rec.explanation}</div>
    `;
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('AI service error. Check console.');
  } finally {
    submitBtn.disabled = false;
  }
});

againBtn.addEventListener('click', () => {
  resultView.style.display = 'none';
  questionsView.style.display = 'block';
  form.reset();
  setStatus('');
});

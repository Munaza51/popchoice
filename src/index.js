import { getMovieRecommendation } from './aiService.js';
import MOVIES from './content.js';

const form = document.getElementById('movie-form');
const statusEl = document.getElementById('status');
const questionsView = document.getElementById('questions-view');
const resultView = document.getElementById('result-view');
const movieBox = document.getElementById('movie-box');
const submitBtn = document.getElementById('submit-btn');
const againBtn = document.getElementById('again');

function setStatus(t) { statusEl.innerText = t || ''; }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;

  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value;
  const q3 = document.getElementById('q3').value;
  const userText = `Favorite: ${q1}. New or Classic: ${q2}. Fun or Serious: ${q3}.`;

  try {
    setStatus('Thinking...');
    const recommendation = await getMovieRecommendation(userText);
    questionsView.style.display = 'none';
    resultView.style.display = 'block';
    movieBox.innerHTML = `<pre>${recommendation}</pre>`;
    setStatus('');
  } catch (err) {
    setStatus('Error: ' + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

againBtn.addEventListener('click', () => {
  resultView.style.display = 'none';
  questionsView.style.display = 'block';
});

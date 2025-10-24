import { getMovieRecommendation } from './aiService.js';
import MOVIES from './content.js';

// عناصر DOM
const startBtn = document.getElementById('start-btn');
const questionsView = document.getElementById('questions-view');
const personView = document.getElementById('person-view');
const personNumberEl = document.getElementById('person-number');
const numPeopleInput = document.getElementById('num-people');
const nextPersonBtn = document.getElementById('next-person');
const resultView = document.getElementById('result-view');
const movieBox = document.getElementById('movie-box');
const againBtn = document.getElementById('again');
const movieForm = document.getElementById('movie-form');
const statusEl = document.getElementById('status');

function setStatus(t) { statusEl.innerText = t || ''; }

let totalPeople = 1;
let currentPerson = 1;
let allAnswers = []; // جواب همه افراد ذخیره میشه

// === Start Movie Night ===
startBtn.addEventListener('click', () => {
  totalPeople = parseInt(numPeopleInput.value) || 1;
  currentPerson = 1;
  allAnswers = [];

  questionsView.style.display = 'none';
  personView.style.display = 'block';
  personNumberEl.textContent = currentPerson;
});

// === Next Person ===
nextPersonBtn.addEventListener('click', async () => {
  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value;
  const q3 = document.getElementById('q3').value;
  const q4 = document.getElementById('q4').value.trim();

  if (!q1 || !q4) {
    setStatus('Please answer all questions!');
    return;
  }

  allAnswers.push({ q1, q2, q3, q4 });
  setStatus('');

  // پاک کردن فرم برای شخص بعدی
  movieForm.reset();

  currentPerson++;
  if (currentPerson <= totalPeople) {
    personNumberEl.textContent = currentPerson;
  } else {
    // همه افراد جواب دادن → درخواست AI
    personView.style.display = 'none';
    resultView.style.display = 'block';

    const combinedText = allAnswers
      .map((a,i) => `Person ${i+1}: Favorite: ${a.q1}. Mood: ${a.q2}, ${a.q3}. Stranded with: ${a.q4}.`)
      .join('\n');

    setStatus('Thinking...');
    try {
      const recommendation = await getMovieRecommendation(combinedText);
      movieBox.innerHTML = recommendation
        .split('\n')
        .map(line => `<div class="explain-line">${line}</div>`)
        .join('');
    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setStatus('');
    }
  }
});

// === Start Over ===
againBtn.addEventListener('click', () => {
  resultView.style.display = 'none';
  questionsView.style.display = 'block';
  movieForm.reset();
  setStatus('');
});

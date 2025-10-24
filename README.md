
# PopChoice — AI Movie Recommender

[Live Demo](https://zingy-kangaroo-c339d9.netlify.app/)

PopChoice is an AI-powered movie recommender that helps you and your friends pick a movie for movie night. Answer a few questions about your preferences, mood, and favorite movies, and get a personalized recommendation with an AI-generated explanation.

---

## Features

- Multi-person support for movie night
- Personalized movie recommendations based on mood, preferences, and favorite films
- Fun, modern UI with vertical question layout
- Next movie and start-over functionality

---

## How to Use

1. Enter the number of people attending and available time.
2. Each person answers the questions about their favorite movie, mood, and ideal co-star.
3. Click **Next Person** for additional participants.
4. Get a movie recommendation and AI explanation.
5. Click **Next Movie** for another suggestion or **Start Over** to reset.

---

## Tech Stack

- HTML, CSS, JavaScript
- OpenAI API (embeddings & explanations)
- Supabase for storing and querying movie embeddings
- Deployed on Netlify

---

## Setup Locally

1. Clone the repo:

```bash
git clone https://github.com/yourusername/popchoice.git
cd popchoice

2. Add .env with your API keys:



VITE_OPENAI_API_KEY=your_openai_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

3. Start the development server:



npm run dev

4. Open http://localhost:5173 in your browser.




---

Key Learnings

Using embeddings with Supabase

Integrating OpenAI + frontend for a smooth recommendation flow

Deploying a full-stack mini-app securely


# license
MIT

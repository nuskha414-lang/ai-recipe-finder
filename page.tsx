'use client';
import React, { useMemo, useState } from 'react';

const creators = [
  { label: 'Any official creator', id: '' },
  { label: 'Nisha Madhulika', id: 'UCgoxyzvouZM-tCgsYzrYtyg' },
  { label: 'Hebbars Kitchen', id: 'UCPPIsrNlEkaFQBk-4uNkOaw' },
  { label: "Kabita's Kitchen", id: 'UCChqsCRFePrP2X897iQkyAA' },
  { label: 'Sanjeev Kapoor Khazana', id: 'UCmoX4QULJ9MB00xW4coMiOw' },
];

export default function Page() {
  const [diet, setDiet] = useState<'Vegetarian' | 'Vegan' | 'Egg' | 'Any'>('Vegetarian');
  const [cuisine, setCuisine] = useState('North Indian');
  const [protein, setProtein] = useState('Paneer');
  const [time, setTime] = useState(25);
  const [allergies, setAllergies] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(2);
  const [creator, setCreator] = useState(creators[0].id);

  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [loadingYT, setLoadingYT] = useState(false);
  const [recipe, setRecipe] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => ({ diet, cuisine, protein, time, allergies, ingredients, servings }), [diet, cuisine, protein, time, allergies, ingredients, servings]);

  async function getRecipe() {
    try {
      setError(null);
      setLoadingRecipe(true);
      setRecipe(null);
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecipe(data);
    } catch (e: any) {
      setError(e.message || 'Failed to get recipe');
    } finally {
      setLoadingRecipe(false);
    }
  }

  async function findYouTube() {
    try {
      setError(null);
      setLoadingYT(true);
      setVideos([]);
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, creatorChannelId: creator }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setVideos(data.results || []);
    } catch (e: any) {
      setError(e.message || 'Failed to search YouTube');
    } finally {
      setLoadingYT(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">AI Recipe Finder</h1>
        <p className="mb-6 text-gray-600">Answer a few inputs, then generate a recipe or jump to an official YouTube video.</p>

        <div className="grid gap-4 bg-white rounded-2xl p-5 shadow">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Diet</span>
              <select className="border rounded-xl p-2" value={diet} onChange={e => setDiet(e.target.value as any)}>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Egg</option>
                <option>Any</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Cuisine</span>
              <input className="border rounded-xl p-2" value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="e.g., North Indian, South Indian" />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Primary protein / main ingredient</span>
              <input className="border rounded-xl p-2" value={protein} onChange={e => setProtein(e.target.value)} placeholder="Paneer, chana, tofu, etc." />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Max time (minutes)</span>
              <input type="number" min={5} max={120} className="border rounded-xl p-2" value={time} onChange={e => setTime(parseInt(e.target.value || '0', 10))} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Servings</span>
              <input type="number" min={1} max={8} className="border rounded-xl p-2" value={servings} onChange={e => setServings(parseInt(e.target.value || '0', 10))} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Allergies / avoid</span>
              <input className="border rounded-xl p-2" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g., nuts, gluten" />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm">What do you have on hand?</span>
            <textarea className="border rounded-xl p-2" rows={3} value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Comma‑separated list of ingredients" />
          </label>

          <div className="grid md:grid-cols-2 gap-3 items-end">
            <button onClick={getRecipe} disabled={loadingRecipe} className="rounded-2xl px-4 py-3 bg-black text-white shadow disabled:opacity-50">
              {loadingRecipe ? 'Cooking…' : 'Get ChatGPT Recipe'}
            </button>

            <div className="grid gap-1">
              <select className="border rounded-xl p-2" value={creator} onChange={e => setCreator(e.target.value)}>
                {creators.map(c => (
                  <option key={c.label} value={c.id}>{c.label}</option>
                ))}
              </select>
              <button onClick={findYouTube} disabled={loadingYT} className="rounded-2xl px-4 py-3 bg-red-600 text-white shadow disabled:opacity-50">{loadingYT ? 'Searching…' : 'Find Official YouTube'}</button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          {recipe && (
            <div className="grid gap-3 border-t pt-4">
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              <p className="text-sm text-gray-600">Servings: {recipe.servings} · Time: ~{recipe.time} min</p>
              {recipe.macros && (
                <p className="text-sm text-gray-600">Approx macros/serving: {recipe.macros.calories} kcal · P {recipe.macros.protein}g · C {recipe.macros.carbs}g · F {recipe.macros.fat}g</p>
              )}
              <div>
                <h3 className="font-medium mb-1">Ingredients</h3>
                <ul className="list-disc ml-6 space-y-0.5">
                  {recipe.ingredients?.map((it: string, i: number) => <li key={i}>{it}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Steps</h3>
                <ol className="list-decimal ml-6 space-y-1">
                  {recipe.steps?.map((it: string, i: number) => <li key={i}>{it}</li>)}
                </ol>
              </div>
              {recipe.tips?.length ? (
                <div>
                  <h3 className="font-medium mb-1">Pro tips</h3>
                  <ul className="list-disc ml-6 space-y-0.5">
                    {recipe.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              ) : null}

              {recipe.youtube_suggestions?.length ? (
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-sm text-gray-700 mb-2">Suggested YouTube searches:</div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.youtube_suggestions.map((q: string, i: number) => (
                      <a key={i} className="underline" target="_blank" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}>{q}</a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {videos?.length ? (
            <div className="grid gap-3 border-t pt-4">
              <h2 className="text-xl font-semibold">Official YouTube matches</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {videos.map(v => (
                  <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" className="rounded-2xl overflow-hidden border hover:shadow">
                    <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                    <div className="p-3">
                      <div className="font-medium line-clamp-2">{v.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{v.channelTitle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="text-xs text-gray-500 mt-6">
          Built for demo purposes. Nutrition is approximate; verify against your needs.
        </footer>
      </div>
    </main>
  );
}

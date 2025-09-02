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

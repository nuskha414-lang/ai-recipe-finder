import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { diet, cuisine, protein, time, allergies, ingredients, servings } = body;

    const system = `You are a veteran Indian home-cooking chef and nutrition-savvy recipe developer. Return compact JSON only.`;
    const user = {
      instruction: 'Create a home-cook friendly recipe with clear steps and realistic timings. Prefer Indian techniques.',
      constraints: { diet, cuisine, protein, max_minutes: time, servings, allergies, on_hand: ingredients },
      output_schema: {
        title: 'string',
        servings: 'number',
        time: 'number',
        macros: { calories: 'number', protein: 'number', carbs: 'number', fat: 'number' },
        ingredients: ['string'],
        steps: ['string'],
        tips: ['string'],
        youtube_suggestions: ['string']
      }
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Return only JSON (no markdown). Input: ${JSON.stringify(user)}` }
        ]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(`OpenAI error: ${errText}`, { status: 500 });
      }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '{}';
    const clean = text.replace(/^```json\n?|\n?```$/g, '');
    const json = JSON.parse(clean);

    return Response.json(json);
  } catch (e: any) {
    return new Response(e?.message || 'Failed to generate recipe', { status: 500 });
  }
}

import { NextRequest } from "next/server";

export const runtime = "edge";

const CREATOR_IDS = [
  "UCgoxyzvouZM-tCgsYzrYtyg", // Nisha Madhulika
  "UCPPIsrNlEkaFQBk-4uNkOaw", // Hebbars Kitchen
  "UCChqsCRFePrP2X897iQkyAA", // Kabita's Kitchen
  "UCmoX4QULJ9MB00xW4coMiOw", // Sanjeev Kapoor Khazana
];

export async function POST(req: NextRequest) {
  try {
    const {
      diet,
      cuisine,
      protein,
      time,
      allergies,
      ingredients,
      servings,
      creatorChannelId,
    } = await req.json();

    const qParts = [cuisine, protein, diet !== "Any" ? diet : "", "quick", "recipe"]
      .concat((ingredients || "").split(",").slice(0, 2))
      .filter(Boolean);
    const query = qParts.join(" ").trim();

    const ids = creatorChannelId ? [creatorChannelId] : CREATOR_IDS;

    const results: any[] = [];
    for (const ch of ids) {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.search = new URLSearchParams({
        key: process.env.YOUTUBE_API_KEY!,
        part: "snippet",
        type: "video",
        maxResults: "6",
        order: "relevance",
        q: query || "easy Indian recipe",
        ...(ch ? { channelId: ch } : {}),
      }).toString();

      const r = await fetch(url.toString());
      if (!r.ok) continue;
      const data = await r.json();
      for (const item of data.items || []) {
        results.push({
          id: item.id?.videoId,
          title: item.snippet?.title,
          channelTitle: item.snippet?.channelTitle,
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.high?.url,
        });
      }
    }

    const unique = Array.from(new Map(results.map((v) => [v.id, v])).values()).slice(
      0,
      8
    );

    return Response.json({ query, results: unique });
  } catch (e: any) {
    return new Response(e?.message || "YouTube search failed", { status: 500 });
  }
}

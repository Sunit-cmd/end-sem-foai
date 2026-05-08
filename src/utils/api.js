import axios from 'axios';
import OpenAI from 'openai';

const GNEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_AI_TOKEN || "";

// Initialize OpenAI client lazily to prevent crashes if token is missing
let aiClient = null;
if (HF_TOKEN && HF_TOKEN !== "YOUR_HF_TOKEN") {
  aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN,
    dangerouslyAllowBrowser: true
  });
}

/**
 * Fetch ISS Live Data (HTTPS)
 */
export const fetchISSPosition = async () => {
  try {
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', { timeout: 8000 });
    return {
      lat: parseFloat(response.data.latitude),
      lng: parseFloat(response.data.longitude),
      timestamp: response.data.timestamp,
      speed: response.data.velocity,
      altitude: response.data.altitude,
      visibility: response.data.visibility
    };
  } catch (error) {
    console.error("ISS API Error:", error.message);
    throw error;
  }
};

/**
 * Fetch Astronauts Data (HTTPS)
 */
export const fetchAstronauts = async () => {
  try {
    const response = await axios.get('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json');
    // Adapt to the response format: { people: [{ name, craft }, ...] }
    return {
      people: response.data.people || []
    };
  } catch (error) {
    console.error("Astronauts API Error:", error.message);
    return { people: [] };
  }
};

/**
 * Reverse Geocoding (HTTPS)
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5`, {
      headers: { 'User-Agent': 'ISS-Dashboard-Production' }
    });
    
    if (response.data && response.data.address) {
      const a = response.data.address;
      return a.country || a.state || a.ocean || a.sea || "Orbital Path (Above Earth)";
    }
    return "Over ocean / remote area";
  } catch (error) {
    return "Over ocean / remote area";
  }
};

/**
 * Fetch Space News via GNews (HTTPS)
 */
export const fetchNews = async (query = 'ISS Space Station', sortBy = 'publishedAt') => {
  if (!GNEWS_API_KEY || GNEWS_API_KEY === 'YOUR_NEWS_API_KEY' || GNEWS_API_KEY === 'af63dcb1068f00a15e9093d0906e7a2b_placeholder') {
    return mockNews;
  }
  
  try {
    const response = await axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&token=${GNEWS_API_KEY}`);
    return response.data.articles.map(art => ({
      title: art.title,
      description: art.description,
      url: art.url,
      urlToImage: art.image,
      publishedAt: art.publishedAt,
      source: { name: art.source.name },
      author: art.source.name
    }));
  } catch (error) {
    console.error("GNews API Error:", error.message);
    return mockNews;
  }
};

/**
 * AI Chatbot Logic (Context Restricted)
 */
export const chatWithAI = async (message, context) => {
  if (!aiClient) {
    return "AI Terminal offline. Please verify VITE_AI_TOKEN in your Vercel settings.";
  }

  const systemPrompt = `You can ONLY answer using the provided dashboard context:
- ISS Position: LAT ${context.lat}, LNG ${context.lng}
- Velocity: ${context.speed} km/h
- Altitude: ${context.altitude} km
- Visibility: ${context.visibility}
- Astronauts in space: ${context.astronauts.join(', ')}
- Top Space News: ${context.news.map(n => n.title).join('; ')}

If asked anything unrelated to the ISS, space news, or the astronauts listed, reply strictly:
'I only answer based on dashboard data.'`;

  try {
    const chatCompletion = await aiClient.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error.message);
    if (error.message?.toLowerCase().includes('loading')) {
      return "Station AI is warming up. Please stand by (20s).";
    }
    return "Intelligence uplink failed. Check telemetry status.";
  }
};

const mockNews = [
  {
    title: "ISS Expedition Updates: Scientific Experiments and Station Maintenance",
    source: { name: "Mission Dispatch" },
    author: "Station Commander",
    publishedAt: new Date().toISOString(),
    description: "The crew continues critical research in microgravity while preparing for upcoming resupply missions.",
    urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
    url: "#"
  }
];

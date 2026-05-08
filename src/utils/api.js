import axios from 'axios';
import OpenAI from 'openai';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_AI_TOKEN || "";

// Initialize client only if token exists to avoid SDK errors on startup
let client = null;
if (HF_TOKEN && HF_TOKEN !== "YOUR_HF_TOKEN") {
  client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN,
    dangerouslyAllowBrowser: true
  });
}

export const fetchISSPosition = async () => {
  try {
    // Primary Source: WhereTheISS.at (HTTPS, CORS friendly)
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', { timeout: 8000 });
    return {
      lat: parseFloat(response.data.latitude),
      lng: parseFloat(response.data.longitude),
      timestamp: response.data.timestamp,
      speed: response.data.velocity
    };
  } catch (error) {
    console.error("Primary ISS API Error:", error.message);
    
    // Fallback Source: Open Notify (Routed through an HTTPS CORS Tunnel)
    try {
      const tunnelUrl = `https://corsproxy.io/?url=${encodeURIComponent('http://api.open-notify.org/iss-now.json')}`;
      const response = await axios.get(tunnelUrl, { timeout: 10000 });
      return {
        lat: parseFloat(response.data.iss_position.latitude),
        lng: parseFloat(response.data.iss_position.longitude),
        timestamp: response.data.timestamp,
        speed: 0
      };
    } catch (fallbackError) {
      console.error("Deep Fallback Failed:", fallbackError.message);
      throw fallbackError;
    }
  }
};

export const fetchAstronauts = async () => {
  const response = await axios.get('http://api.open-notify.org/astros.json');
  return response.data;
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5`, {
      headers: {
        'User-Agent': 'ISS-Dashboard-App'
      }
    });
    
    if (response.data && response.data.address) {
      const a = response.data.address;
      const place = a.country || a.state || a.ocean || a.sea || a.city || a.town;
      return place ? place : "Orbital Path (Above Earth)";
    }
    
    return "Orbital Path (Ocean)";
  } catch (error) {
    return "Orbital Path (Ocean)";
  }
};

export const fetchNews = async (query = 'ISS Space', sortBy = 'publishedAt') => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'YOUR_NEWS_API_KEY') {
    return mockNews;
  }
  
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&sortBy=${sortBy}&apiKey=${NEWS_API_KEY}&pageSize=10`);
    return response.data.articles;
  } catch (error) {
    console.error("News API Error:", error);
    return mockNews;
  }
};

export const chatWithAI = async (message, context) => {
  if (!client) {
    return "AI Assistant is offline. Please ensure a valid VITE_HF_TOKEN is provided in the .env file and restart the server.";
  }

  const systemPrompt = `You can ONLY answer using dashboard context:
- ISS location: ${context.location}
- ISS speed: ${context.speed} km/h
- astronauts currently in space: ${context.astronauts.join(', ')}
- displayed news articles: ${context.news.map(n => n.title).join('; ')}

If asked anything unrelated reply:
'I only answer based on dashboard data.'`;

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Detailed AI Error:", error);
    
    // Check if it's an authentication error
    if (error.status === 401 || error.status === 403) {
      return "Authentication failed. Please check if your HF Token is valid and has access to this model.";
    }
    
    if (error.message?.toLowerCase().includes('loading')) {
      return "My intelligence systems are currently warming up. Please try again in about 20 seconds.";
    }
    
    return `AI Connection Error: ${error.message || 'Unknown error'}. Please check the console for details.`;
  }
};

const mockNews = [
  {
    title: "ISS Astronauts Conduct Spacewalk for Battery Upgrades",
    source: { name: "Space.com" },
    author: "Tariq Malik",
    publishedAt: new Date().toISOString(),
    description: "Astronauts aboard the International Space Station venture outside for a critical power system upgrade.",
    urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
    url: "#"
  },
  {
    title: "New Research Reveals Effects of Long-Term Spaceflight on Human Bone Density",
    source: { name: "NASA News" },
    author: "Sarah Loff",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    description: "Study shows significant impacts on bone health during extended missions beyond Earth orbit.",
    urlToImage: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&q=80&w=1000",
    url: "#"
  },
  {
    title: "Commercial Resupply Mission Successfully Docks with ISS",
    source: { name: "SpaceX" },
    author: "Elon Musk",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    description: "Dragon capsule delivers fresh supplies and new scientific experiments to the orbiting laboratory.",
    urlToImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000",
    url: "#"
  }
];

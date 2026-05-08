# Real-Time ISS and News Intelligence Dashboard

A production-ready mission control dashboard for tracking the International Space Station (ISS) in real-time, coupled with space-related news intelligence and an AI assistant.

## Features

- **Live ISS Tracking**: Real-time position updates every 15 seconds.
- **Interactive Map**: Leaflet.js integration with trajectory visualization and dark/light mode support.
- **Orbital Analytics**: Live speed calculation and trend visualization using Recharts.
- **News Intelligence**: Aggregated space news with source distribution analytics and localStorage caching.
- **AI Mission Assistant**: Context-aware chatbot powered by Mistral-7B-Instruct-v0.2 via Hugging Face.
- **Modern UI**: Clean beige/cream aesthetic with glassmorphism, responsive design, and smooth Framer Motion animations.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **Mapping**: Leaflet.js
- **Charts**: Recharts
- **Animations**: Framer Motion
- **API**: Axios
- **AI**: Hugging Face Inference API (Mistral-7B)

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_HF_TOKEN=your_huggingface_token
   VITE_NEWS_API_KEY=your_newsapi_key
   ```
4. **Run development server**:
   ```bash
   npm run dev
   ```

## Deployment

To deploy to Vercel:

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Deploy via Vercel CLI**:
   ```bash
   vercel --prod
   ```

## License

MIT

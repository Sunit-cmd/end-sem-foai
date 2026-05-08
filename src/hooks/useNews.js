import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import toast from 'react-hot-toast';

const CACHE_KEY = 'iss_dashboard_news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

export const useNews = (query = 'ISS Space', sortBy = 'publishedAt') => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getNews = async (force = false) => {
    setLoading(true);
    
    // Check cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) {
          setNews(data);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const data = await fetchNews(query, sortBy);
      setNews(data);
      
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch news');
      toast.error('News systems offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, [query, sortBy]);

  return {
    news,
    loading,
    error,
    refresh: () => getNews(true)
  };
};

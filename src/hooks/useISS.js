import { useState, useEffect, useRef } from 'react';
import { fetchISSPosition, fetchAstronauts, reverseGeocode } from '../utils/api';
import { calculateSpeed } from '../utils/haversine';
import toast from 'react-hot-toast';

export const useISS = (autoRefresh = true) => {
  const [position, setPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState([]);
  const [nearestPlace, setNearestPlace] = useState('Acquiring...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const lastPositionRef = useRef(null);
  const retryCountRef = useRef(0);

  const updateISSData = async () => {
    try {
      const pos = await fetchISSPosition();
      retryCountRef.current = 0; // Reset on success
      
      // Calculate or use API speed
      let speed = pos.speed || 0;
      if (!speed && lastPositionRef.current) {
        speed = calculateSpeed(lastPositionRef.current, pos);
      }

      if (speed > 0) {
        setSpeedHistory(prev => {
          const newItem = { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            speed: Math.round(speed) 
          };
          // Filter out duplicates based on time to avoid chart glitches
          if (prev.length > 0 && prev[prev.length - 1].time === newItem.time) return prev;
          return [...prev, newItem].slice(-30);
        });
      }
      
      setPosition(pos);
      lastPositionRef.current = pos;
      
      // Unique positions for history
      setHistory(prev => {
        const newCoords = [pos.lat, pos.lng];
        if (prev.length > 0) {
           const last = prev[prev.length - 1];
           if (last[0] === newCoords[0] && last[1] === newCoords[1]) return prev;
        }
        return [...prev, newCoords].slice(-15);
      });
      
      // Reverse geocode with a small delay to avoid rate limits
      setTimeout(async () => {
        try {
          const place = await reverseGeocode(pos.lat, pos.lng);
          setNearestPlace(place || "Orbital Path");
        } catch (geoErr) {
          setNearestPlace("Above Earth's Ocean");
        }
      }, 500);
      
      setError(null);
    } catch (err) {
      retryCountRef.current += 1;
      setError(err.message || 'Signal Error');
      
      // Only toast if it fails 2 times in a row
      if (retryCountRef.current >= 2) {
        toast.error('ISS Uplink Interrupted - Retrying...', { id: 'iss-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAstros = async () => {
      try {
        const data = await fetchAstronauts();
        setAstronauts(data.people || []);
      } catch (err) {
        console.error('Failed to fetch astronauts', err);
      }
    };
    
    getAstros();
    updateISSData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(updateISSData, 15000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return {
    position,
    history,
    speedHistory,
    astronauts,
    nearestPlace,
    loading,
    error,
    refresh: updateISSData
  };
};

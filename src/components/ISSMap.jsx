import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom ISS Icon (Premium SVG)
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [45, 45],
  iconAnchor: [22, 22],
});

function RecenterMap({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.panTo([position.lat, position.lng], { animate: true, duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export const ISSMap = ({ position, history, isDarkMode }) => {
  if (!position) return (
    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Acquiring Satellite Signal...</p>
    </div>
  );

  return (
    <div className="h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/20 relative group">
      <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
        <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">Live Telemetry Feed</p>
      </div>
      
      <MapContainer 
        center={[position.lat, position.lng]} 
        zoom={3} 
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />
        <Polyline 
          positions={history} 
          color="#3b82f6" 
          weight={2} 
          opacity={0.8} 
          dashArray="4, 8"
        />
        <Marker position={[position.lat, position.lng]} icon={issIcon}>
          <Tooltip permanent direction="top" offset={[0, -20]} className="bg-slate-900 border-none text-white text-[10px] font-mono p-2 rounded shadow-xl opacity-90">
            <div className="space-y-0.5">
              <div>LAT: {position.lat.toFixed(4)}</div>
              <div>LNG: {position.lng.toFixed(4)}</div>
              <div className="text-blue-400">T: {new Date().toLocaleTimeString()}</div>
            </div>
          </Tooltip>
        </Marker>
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
};

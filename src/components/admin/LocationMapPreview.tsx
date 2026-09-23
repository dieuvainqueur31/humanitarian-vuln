import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationMapPreviewProps {
  latitude: number | null;
  longitude: number | null;
  locationName: string;
}

// Helper component to center map smoothly when coordinates change
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

export const LocationMapPreview: React.FC<LocationMapPreviewProps> = ({
  latitude,
  longitude,
  locationName,
}) => {
  const hasValidCoordinates = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  if (!hasValidCoordinates) {
    return (
      <div className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs">
        <p>No valid coordinates provided.</p>
        <p className="text-[11px] text-slate-600 mt-1">Enter a location or use Auto-Fetch GPS to view map preview.</p>
      </div>
    );
  }

  const position: [number, number] = [latitude!, longitude!];

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-800 relative z-0">
      <MapContainer center={position} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-xs font-sans">
              <strong>{locationName || 'Selected Location'}</strong>
              <br />
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          </Popup>
        </Marker>
        <MapRecenter lat={latitude!} lng={longitude!} />
      </MapContainer>
    </div>
  );
};
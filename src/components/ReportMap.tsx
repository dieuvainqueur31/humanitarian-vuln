import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LocationItem } from '../types/report';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapFlyToProps {
  center: [number, number];
}

// Controller component to smoothly recalculate map center when selection changes
const MapController: React.FC<MapFlyToProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
};

interface ReportMapProps {
  selectedLocation: LocationItem | null;
}

export const ReportMap: React.FC<ReportMapProps> = ({ selectedLocation }) => {
  const defaultCenter: [number, number] = [-2.5083, 28.8608]; // Bukavu default

  const currentCenter: [number, number] =
    selectedLocation?.latitude && selectedLocation?.longitude
      ? [selectedLocation.latitude, selectedLocation.longitude]
      : defaultCenter;

  return (
    <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer center={currentCenter} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={currentCenter} />
        {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
          <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedLocation.locationName}</p>
                <p className="text-slate-600">
                  {selectedLocation.city}, {selectedLocation.province} ({selectedLocation.country})
                </p>
                <p className="text-slate-400 font-mono text-[10px]">
                  Lat: {selectedLocation.latitude}, Lng: {selectedLocation.longitude}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
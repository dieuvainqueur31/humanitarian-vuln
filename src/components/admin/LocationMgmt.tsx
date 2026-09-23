import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../services/api';
import type { LocationItem } from '../../types/admin';
import { MapPin, Plus, RefreshCw, Compass, Search, Map as MapIcon, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker asset URLs in bundled React environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to smoothly re-center Leaflet map when inputs change
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
};

export const LocationMgmt: React.FC<{ onLocationCreated?: () => void }> = ({ onLocationCreated }) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Selected location state for viewing in modal map viewer
  const [activeMapLocation, setActiveMapLocation] = useState<LocationItem | null>(null);

  // Form State
  const [country, setCountry] = useState('Democratic Republic of Congo');
  const [province, setProvince] = useState('North Kivu');
  const [territory, setTerritory] = useState('Rutshuru');
  const [city, setCity] = useState('Kiwanja');
  const [sector, setSector] = useState('Bwito');
  const [locationName, setLocationName] = useState('Kiwanja');
  const [latitude, setLatitude] = useState<number>(-1.0833);
  const [longitude, setLongitude] = useState<number>(29.4167);
  const [precisionLevel, setPrecisionLevel] = useState('CITY');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<LocationItem[]>('/locations');
      setLocations(res || []);
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Automatic Coordinates Lookup via OpenStreetMap Nominatim
  const lookupCoordinates = useCallback(async () => {
    const params = new URLSearchParams({
      format: 'json',
      limit: '1',
    });

    if (city || sector) params.append('city', city || sector);
    if (territory) params.append('county', territory);
    if (province) params.append('state', province);
    if (country) params.append('country', country);

    if (!params.get('city') && !params.get('country')) return;

    try {
      setIsGeocoding(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          'User-Agent': 'HumanitarianSystemAdmin/1.0',
        },
      });

      const data = await res.json();

      if (data && data.length > 0) {
        setLatitude(parseFloat(parseFloat(data[0].lat).toFixed(4)));
        setLongitude(parseFloat(parseFloat(data[0].lon).toFixed(4)));
      }
    } catch (err) {
      console.error('Geocoding fetch error:', err);
    } finally {
      setIsGeocoding(false);
    }
  }, [sector, city, territory, province, country]);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiFetch<LocationItem>('/locations', {
        method: 'POST',
        body: JSON.stringify({
          country,
          province,
          territory,
          city,
          sector,
          locationName,
          latitude: Number(latitude),
          longitude: Number(longitude),
          precisionLevel,
        }),
      });

      alert('Location successfully registered!');
      fetchLocations();
      if (onLocationCreated) onLocationCreated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create location');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidCoordinate = !isNaN(latitude) && !isNaN(longitude);

  return (
    <div className="space-y-6">
      {/* Create Location Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> Register Regional Location
          </h2>
          <button
            type="button"
            onClick={lookupCoordinates}
            disabled={isGeocoding}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs rounded-lg flex items-center gap-1 font-mono transition-colors"
          >
            <Search className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-spin' : ''}`} />
            {isGeocoding ? 'Locating...' : 'Auto-Fetch GPS'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <form onSubmit={handleCreateLocation} className="lg:col-span-2 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={lookupCoordinates}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Province</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  onBlur={lookupCoordinates}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Territory</label>
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={lookupCoordinates}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Sector</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  onBlur={lookupCoordinates}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  onBlur={lookupCoordinates}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>Latitude</span>
                  {isGeocoding && <span className="text-sky-400 font-mono text-[10px]">Updating...</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>Longitude</span>
                  {isGeocoding && <span className="text-sky-400 font-mono text-[10px]">Updating...</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Precision Level</label>
                <select
                  value={precisionLevel}
                  onChange={(e) => setPrecisionLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="NEIGHBORHOOD">NEIGHBORHOOD</option>
                  <option value="SECTOR">SECTOR</option>
                  <option value="CITY">CITY</option>
                  <option value="PROVINCE">PROVINCE</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              {submitting ? 'Registering...' : 'Add Location'}
            </button>
          </form>

          {/* Form Interactive Live Map Preview */}
          <div className="flex flex-col space-y-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-sky-400" /> Real-time Coordinates Preview
            </span>
            <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative z-0">
              {isValidCoordinate ? (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={12}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <strong>{locationName || 'Location Target'}</strong>
                        <br />
                        {city}, {province}
                      </div>
                    </Popup>
                  </Marker>
                  <MapRecenter lat={latitude} lng={longitude} />
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  Enter valid GPS coordinates to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Locations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" /> Active Regional Locations ({locations.length})
          </h2>
          <button onClick={fetchLocations} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-slate-500 text-xs">Loading locations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">City / Sector</th>
                  <th className="py-2.5 px-3">Province / Country</th>
                  <th className="py-2.5 px-3">GPS Coordinates</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-950/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{loc.id}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{loc.locationName}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {loc.city}, {loc.sector}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {loc.province}, {loc.country}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-sky-400">
                      {loc.latitude}, {loc.longitude}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-amber-400">{loc.precisionLevel}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveMapLocation(loc)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-[11px] rounded flex items-center gap-1 ml-auto font-sans transition-colors"
                      >
                        <MapIcon className="w-3 h-3" /> View Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Map Inspection Window */}
      {activeMapLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{activeMapLocation.locationName}</h3>
                <p className="text-xs text-slate-400">
                  {activeMapLocation.city}, {activeMapLocation.province}, {activeMapLocation.country}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMapLocation(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-800 relative z-0">
              <MapContainer
                center={[activeMapLocation.latitude, activeMapLocation.longitude]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[activeMapLocation.latitude, activeMapLocation.longitude]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>{activeMapLocation.locationName}</strong>
                      <br />
                      GPS: {activeMapLocation.latitude}, {activeMapLocation.longitude}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>
                Lat: <strong className="text-sky-400">{activeMapLocation.latitude}</strong> | Long:{' '}
                <strong className="text-sky-400">{activeMapLocation.longitude}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveMapLocation(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
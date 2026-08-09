import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition, onSelect }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      const selectedLocation = {
        latitude: lat,
        longitude: lng,
      };

      setPosition(selectedLocation);

      onSelect(lat, lng);
    },
  });

  return position ? (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={defaultIcon}
    />
  ) : null;
}

export default function LocationPicker({ initialPosition = null, onSelect }) {
  const [position, setPosition] = useState(initialPosition);

  // Nigeria-centered default view.
  const defaultCenter = [9.082, 8.6753];

  const center = position
    ? [position.latitude, position.longitude]
    : defaultCenter;

  return (
    <div className="overflow-hidden rounded-2xl border border-border-muted">
      <MapContainer
        center={center}
        zoom={position ? 15 : 6}
        style={{
          height: '350px',
          width: '100%',
        }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={setPosition}
          onSelect={onSelect}
        />
      </MapContainer>

      <div className="bg-white p-3 text-sm text-body-text">
        Click anywhere on the map to select the pickup location.
      </div>
    </div>
  );
}

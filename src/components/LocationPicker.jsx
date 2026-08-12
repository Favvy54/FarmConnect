import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';

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
  shadowSize: [41, 41],
});

function LocationMarker({
  position,
  setPosition,
  onSelect,
}) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      const selectedLocation = {
        latitude: lat,
        longitude: lng,
      };

      setPosition(selectedLocation);

      if (onSelect) {
        onSelect(lat, lng);
      }
    },
  });

  return position ? (
    <Marker
      position={[
        position.latitude,
        position.longitude,
      ]}
      icon={defaultIcon}
    />
  ) : null;
}

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(
      [
        position.latitude,
        position.longitude,
      ],
      15
    );
  }, [position, map]);

  return null;
}

export default function LocationPicker({
  initialPosition = null,
  onSelect,
  onClose,
}) {
  const [position, setPosition] =
    useState(initialPosition);

  /*
   * IMPORTANT:
   * When the parent gets new coordinates from
   * "Find Location From Address", update the map's
   * internal position.
   */
  useEffect(() => {
    if (!initialPosition) return;

    setPosition(initialPosition);
  }, [
    initialPosition?.latitude,
    initialPosition?.longitude,
  ]);

  const defaultCenter = [9.082, 8.6753];

  const center = position
    ? [
        position.latitude,
        position.longitude,
      ]
    : defaultCenter;

  return (
    <div className="relative">
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[1000] flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-md transition hover:bg-white hover:text-gray-900"
        aria-label="Close map"
      >
        ×
      </button>
    )}
      <MapContainer
        center={center}
        zoom={position ? 15 : 6}
        style={{
          height: '350px',
          width: '100%',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController position={position} />

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

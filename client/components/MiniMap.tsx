import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_POSITION = { lat: 28.6139, lng: 77.2090 }; // Delhi fallback

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address: "Selected Location" });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MiniMap({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          onLocationSelect({ ...coords, address: "Current Location" });
        },
        () => {
          setPosition(DEFAULT_POSITION);
          onLocationSelect({ ...DEFAULT_POSITION, address: "Default Location" });
        }
      );
    } else {
      setPosition(DEFAULT_POSITION);
      onLocationSelect({ ...DEFAULT_POSITION, address: "Default Location" });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <MapContainer
        center={[position?.lat || DEFAULT_POSITION.lat, position?.lng || DEFAULT_POSITION.lng]}
        zoom={13}
        style={{ height: "250px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
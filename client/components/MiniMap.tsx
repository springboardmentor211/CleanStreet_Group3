import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Position {
  lat: number;
  lng: number;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

const DEFAULT_POSITION: Position = { lat: 28.6139, lng: 77.2090 }; // Delhi fallback

// Function to perform reverse geocoding using OpenStreetMap Nominatim API
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CleanStreet-App'
        }
      }
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      // Clean up the address by removing unnecessary details
      let address = data.display_name;
      // Prioritize road, city, and state information
      if (data.address) {
        const { road, suburb, city, town, village, state, postcode, country } = data.address;
        const parts = [road, suburb, city || town || village, state, postcode].filter(Boolean);
        if (parts.length > 0) {
          address = parts.join(', ');
        }
      }
      return address;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Function to perform forward geocoding (address to coordinates)
const forwardGeocode = async (address: string): Promise<Position | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CleanStreet-App'
        }
      }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding failed:", error);
    return null;
  }
};

interface LocationMarkerProps {
  position: Position | null;
  setPosition: (position: Position) => void;
  onLocationSelect: (location: LocationData) => void;
}

function LocationMarker({ position, setPosition, onLocationSelect }: LocationMarkerProps) {
  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      // Show loading state first
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address: "Getting address..." });
      // Perform reverse geocoding to get actual address
      const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

// Component to handle external map updates
interface MapUpdaterProps {
  position: Position | null;
}

function MapUpdater({ position }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 15); // Zoom to level 15 for precise location
    }
  }, [position, map]);

  return null;
}

interface MiniMapProps {
  onLocationSelect: (location: LocationData) => void;
  searchAddress?: string; // External address to search for
}

export default function MiniMap({ onLocationSelect, searchAddress }: MiniMapProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [searchedPosition, setSearchedPosition] = useState<Position | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Handle external address search
  useEffect(() => {
    if (searchAddress && 
        searchAddress.length > 3 && 
        !searchAddress.includes("Getting") &&
        !searchAddress.includes("Coordinates:")) {
      
      setIsSearching(true);
      
      const searchLocation = async () => {
        try {
          const coords = await forwardGeocode(searchAddress);
          if (coords) {
            // Only update if the coordinates are significantly different from current position
            const isSignificantChange = !position || 
              Math.abs(coords.lat - position.lat) > 0.001 || 
              Math.abs(coords.lng - position.lng) > 0.001;
            
            if (isSignificantChange) {
              setSearchedPosition(coords);
              setPosition(coords);
              // Don't call onLocationSelect here as it would create a loop
            }
          }
        } finally {
          setIsSearching(false);
        }
      };
      
      const timeoutId = setTimeout(searchLocation, 800); // Debounce for 800ms
      return () => {
        clearTimeout(timeoutId);
        setIsSearching(false);
      };
    } else {
      setIsSearching(false);
    }
  }, [searchAddress, position]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          // Show loading state first
          onLocationSelect({ ...coords, address: "Getting current address..." });
          // Get actual address for current location
          const address = await reverseGeocode(coords.lat, coords.lng);
          onLocationSelect({ ...coords, address });
        },
        async () => {
          setPosition(DEFAULT_POSITION);
          // Show loading state first
          onLocationSelect({ ...DEFAULT_POSITION, address: "Getting address..." });
          // Get actual address for default location
          const address = await reverseGeocode(DEFAULT_POSITION.lat, DEFAULT_POSITION.lng);
          onLocationSelect({ ...DEFAULT_POSITION, address });
        }
      );
    } else {
      const getDefaultAddress = async () => {
        setPosition(DEFAULT_POSITION);
        // Show loading state first
        onLocationSelect({ ...DEFAULT_POSITION, address: "Getting address..." });
        const address = await reverseGeocode(DEFAULT_POSITION.lat, DEFAULT_POSITION.lng);
        onLocationSelect({ ...DEFAULT_POSITION, address });
      };
      getDefaultAddress();
    }
    // eslint-disable-next-line
  }, []);

  // Only render the map once position is set
  if (!position) {
    return <div style={{ height: "250px", width: "100%", borderRadius: "12px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map...</div>;
  }
  return (
    <div style={{ width: "100%", position: "relative" }}>
      {isSearching && (
        <div 
          style={{ 
            position: "absolute", 
            top: "10px", 
            right: "10px", 
            background: "rgba(0,0,0,0.7)", 
            color: "white", 
            padding: "4px 8px", 
            borderRadius: "4px", 
            fontSize: "12px", 
            zIndex: 1000 
          }}
        >
          Searching...
        </div>
      )}
      <MapContainer
        // @ts-ignore
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: "250px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          // @ts-ignore
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        <MapUpdater position={searchedPosition} />
      </MapContainer>
    </div>
  );
}
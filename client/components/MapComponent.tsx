import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

const MapComponent = ({ onLocationSelect }: MapComponentProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);
  const [searchAddress, setSearchAddress] = useState("");

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Simulate map click coordinates
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to approximate lat/lng (simplified simulation)
    const lat = 40.7128 + (y - rect.height / 2) / 1000;
    const lng = -74.0060 + (x - rect.width / 2) / 1000;
    
    const location = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
    
    setSelectedLocation(location);
    onLocationSelect?.(location);
    toast.success("Location selected successfully!");
  };

  const handleAddressSearch = () => {
    if (!searchAddress.trim()) {
      toast.error("Please enter an address to search");
      return;
    }
    
    // Simulate geocoding
    const location = {
      lat: 40.7128 + Math.random() * 0.01,
      lng: -74.0060 + Math.random() * 0.01,
      address: searchAddress
    };
    
    setSelectedLocation(location);
    onLocationSelect?.(location);
    toast.success("Address found and location selected!");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for an address..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
        />
        <Button onClick={handleAddressSearch} size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div 
        onClick={handleMapClick}
        className="relative w-full h-64 bg-muted rounded-lg border-2 border-dashed border-border cursor-crosshair overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Map Placeholder Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Click on the map to select location</p>
            <p className="text-xs text-muted-foreground">(Interactive map will be integrated with Mapbox)</p>
          </div>
        </div>

        {/* Selected Location Marker */}
        {selectedLocation && (
          <div 
            className="absolute w-6 h-6 -ml-3 -mt-6 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <MapPin className="h-6 w-6 text-destructive fill-destructive/20" />
          </div>
        )}

        {/* Location Info Overlay */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border rounded-md p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-civic-blue" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Selected Location</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.lat}, {selectedLocation.lng}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
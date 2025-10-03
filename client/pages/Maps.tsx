import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { issuesAPI } from "@/lib/api";
import { Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Forward geocoding function (same as in MiniMap)
const forwardGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
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

export default function Maps() {
  const [issues, setIssues] = useState([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const searchMarkerRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Function to clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  };

  // Function to add markers for issues
  const addIssueMarkers = (issuesToShow) => {
    if (!mapRef.current) return;
    
    clearMarkers();
    
    issuesToShow.forEach(issue => {
      // Get lat/lng from issue.location (GeoJSON or custom)
      let lat, lng;
      if (issue.location && issue.location.coordinates) {
        // GeoJSON: [lng, lat]
        lng = issue.location.coordinates[0];
        lat = issue.location.coordinates[1];
      } else if (issue.location && issue.location.latitude && issue.location.longitude) {
        lat = issue.location.latitude;
        lng = issue.location.longitude;
      }
      if (lat && lng) {
        // Color by category/type/level
        const categoryColors = {
          Pothole: "#e53e3e",
          Garbage: "#38a169",
          Streetlight: "#3182ce",
          Water: "#805ad5",
          Other: "#d69e2e"
        };
        const color = categoryColors[issue.category] || "#718096";
        const marker = L.circleMarker([lat, lng], {
          radius: 10,
          color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 2
        }).addTo(mapRef.current);
        
        // Store marker reference
        markersRef.current.push(marker);
        
        // Custom popup with clickable info icon
        const popupContent = document.createElement("div");
        popupContent.innerHTML = `<b>${issue.title}</b><br/>${issue.category || ""}`;
        const infoBtn = document.createElement("span");
        infoBtn.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#3182ce' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12' y2='8'/></svg>`;
        infoBtn.style.cssText = "display:inline-block;margin-top:8px;cursor:pointer;";
        infoBtn.onclick = () => {
          navigate(`/issues/${issue._id}`);
        };
        popupContent.appendChild(infoBtn);
        marker.bindPopup(popupContent);
      }
    });
  };

  useEffect(() => {
    // Create map only once
    if (mapRef.current) return;
    const map = L.map("map").setView([28.6139, 77.2090], 12); // Delhi default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await issuesAPI.getAll();
        let loadedIssues = [];
        if (res && res.issues) {
          loadedIssues = res.issues;
        } else if (res && res.data) {
          loadedIssues = res.data.issues || [];
        }
        setIssues(loadedIssues);
        console.log(`Loaded ${loadedIssues.length} issues`);
        console.log(loadedIssues);
        addIssueMarkers(loadedIssues);
        
        // Check for URL parameters to focus on specific issue
        const issueId = searchParams.get('issueId');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        
        if (issueId && mapRef.current) {
          // Find the specific issue and zoom to it
          const targetIssue = loadedIssues.find(issue => issue._id === issueId);
          if (targetIssue) {
            let issueLat, issueLng;
            if (targetIssue.location && targetIssue.location.coordinates) {
              issueLng = targetIssue.location.coordinates[0];
              issueLat = targetIssue.location.coordinates[1];
            } else if (targetIssue.location && targetIssue.location.latitude && targetIssue.location.longitude) {
              issueLat = targetIssue.location.latitude;
              issueLng = targetIssue.location.longitude;
            }
            if (issueLat && issueLng) {
              mapRef.current.setView([issueLat, issueLng], 16); // Close zoom for specific issue
            }
          }
        } else if (lat && lng && mapRef.current) {
          // Direct coordinates provided
          mapRef.current.setView([parseFloat(lat), parseFloat(lng)], 16);
        }
      } catch (err) {
        setIssues([]);
      }
    }
    fetchIssues();
  }, [searchParams]);

  // Handle address search
  const handleAddressSearch = async () => {
    if (!searchAddress.trim() || !mapRef.current) return;
    
    setIsSearching(true);
    try {
      const coords = await forwardGeocode(searchAddress);
      if (coords) {
        // Remove previous search marker
        if (searchMarkerRef.current) {
          mapRef.current.removeLayer(searchMarkerRef.current);
        }
        
        // Add new search marker
        const searchIcon = L.divIcon({
          html: `<div style="background: #ff6b35; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><div style="background: white; border-radius: 50%; width: 8px; height: 8px;"></div></div>`,
          iconSize: [20, 20],
          className: 'custom-search-icon'
        });
        
        searchMarkerRef.current = L.marker([coords.lat, coords.lng], { 
          icon: searchIcon 
        }).addTo(mapRef.current);
        
        searchMarkerRef.current.bindPopup(`<b>Search Result</b><br/>${searchAddress}`);
        
        // Zoom to location
        mapRef.current.setView([coords.lat, coords.lng], 15);
      } else {
        alert("Location not found. Please try a different address.");
      }
    } catch (error) {
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search on Enter key press
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  return (
    <Layout>
      <div className="w-[80%] mx-auto mt-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">City Map</h1>
        
        {/* Search Bar */}
        <div className="w-full max-w-md mb-6 flex gap-2">
          <Input
            type="text"
            placeholder="Search for an address, city, or location..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleAddressSearch}
            disabled={isSearching || !searchAddress.trim()}
            className="px-4"
          >
            {isSearching ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div id="map" style={{ height: "650px", width: "100%", borderRadius: "12px", overflow: "hidden" }}></div>
        
        {/* Legend and Info section */}
        <div className="text-white mt-4 text-center">
          <div>Issues loaded: {issues.length}</div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-3 flex-wrap">
            {[
              { category: "Pothole", color: "#e53e3e" },
              { category: "Garbage", color: "#38a169" },
              { category: "Streetlight", color: "#3182ce" },
              { category: "Water", color: "#805ad5" },
              { category: "Other", color: "#d69e2e" }
            ].map(({ category, color }) => (
              <div key={category} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full border border-white" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-300 mt-2">
            Click on markers to view issue details • Search for locations to zoom the map
          </div>
        </div>
      </div>
    </Layout>
  );
}

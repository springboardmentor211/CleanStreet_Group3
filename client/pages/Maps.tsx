import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { issuesAPI } from "@/lib/api";
import { Info } from "lucide-react";

export default function Maps() {
  const [issues, setIssues] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();

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

        // Add markers to map
        if (mapRef.current) {
          loadedIssues.forEach(issue => {
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
        }
      } catch (err) {
        setIssues([]);
      }
    }
    fetchIssues();
  }, []);

  return (
    <Layout>
      <div className="w-[80%] mx-auto mt-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">City Map</h1>
        <div id="map" style={{ height: "650px", width: "100%", borderRadius: "12px", overflow: "hidden" }}></div>
        {/* For debugging: show number of issues fetched */}
        <div className="text-white mt-4">Issues loaded: {issues.length}</div>
      </div>
    </Layout>
  );
}

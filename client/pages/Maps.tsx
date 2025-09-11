import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Maps() {
  useEffect(() => {
    // Create map only once
    const map = L.map("map").setView([28.6139, 77.2090], 12); // Delhi default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    return () => {
      map.remove();
    };
  }, []);

  return (
    <Layout>
      <div className="w-[80%] mx-auto mt-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">City Map</h1>
  <div id="map" style={{ height: "650px", width: "100%", borderRadius: "12px", overflow: "hidden" }}></div>
      </div>
    </Layout>
  );
}

"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PumaMap from "./PumaMap";
import type { Stats, Donation } from "@/lib/types";
const national: L.LatLngBoundsExpression = [
  [14.2, -118.5],
  [32.8, -86.5],
];
export default function DonationMap({
  sites,
  active,
  paused = false,
}: {
  sites: Stats["sites"];
  active: Donation | null;
  paused?: boolean;
}) {
  const node = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    markers = useRef<L.LayerGroup | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    if (!node.current) return;
    const m = L.map(node.current, {
      zoomControl: false,
      zoomSnap: 0.1,
      scrollWheelZoom: false,
    }).fitBounds(national, { padding: [15, 15] });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    map.current = m;
    markers.current = L.layerGroup().addTo(m);
    const resize = new ResizeObserver(() => {
      m.invalidateSize();
      if (!activeRef.current) m.fitBounds(national, { padding: [15, 15] });
    });
    resize.observe(node.current);
    return () => {
      resize.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);
  const markerData = JSON.stringify(sites);
  useEffect(() => {
    if (!markers.current) return;
    markers.current.clearLayers();
    for (const site of sites) {
      const div = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = site.nombre;
      const text = document.createElement("p");
      text.textContent = `${site.total.toLocaleString("es-MX")} toallas · ${site.count} donaciones`;
      div.append(title, text);
      L.marker([site.latitud, site.longitud], {
        icon: L.divIcon({
          className:
            "donation-pin " + (active?.site_id === site.id ? "selected" : ""),
          html: "<span></span>",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
        zIndexOffset: active?.site_id === site.id ? 1000 : 0,
      })
        .bindPopup(div)
        .addTo(markers.current);
    }
  }, [markerData, active?.site_id]);
  useEffect(() => {
    if (!map.current) return;
    const site = sites.find((s) => s.id === active?.site_id);
    if (site)
      map.current.flyTo([site.latitud, site.longitud], 13, { duration: 2 });
    else map.current.flyToBounds(national, { duration: 2, padding: [15, 15] });
  }, [active?.id]);
  return (
    <>
      <div
        ref={node}
        className="map"
        aria-label="Mapa de sedes participantes en México"
      />
      <div className="puma-safe-zone"><PumaMap paused={paused} /></div>
    </>
  );
}

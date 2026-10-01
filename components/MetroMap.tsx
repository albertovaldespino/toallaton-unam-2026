"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Stats } from "@/lib/types";
export default function MetroMap({ sites }: { sites: Stats["sites"] }) {
  const host = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    group = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const m = L.map(host.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    }).fitBounds(
      [
        [19.24, -99.28],
        [19.72, -98.99],
      ],
      { padding: [12, 12] },
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);
    map.current = m;
    group.current = L.layerGroup().addTo(m);
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current,
      g = group.current;
    if (!m || !g) return;
    g.clearLayers();
    const used: L.Point[] = [];
    for (const site of sites.filter((s) =>
      ["Ciudad de México", "Estado de México"].includes(s.estado),
    )) {
      const original = L.latLng(site.latitud, site.longitud),
        base = m.latLngToLayerPoint(original);
      let p = base;
      for (let i = 0; i < 100 && used.some((q) => q.distanceTo(p) < 13); i++) {
        const a = i * 2.399;
        p = base.add(
          L.point(Math.cos(a), Math.sin(a)).multiplyBy(5 + Math.sqrt(i) * 5),
        );
      }
      used.push(p);
      const coordinate = m.layerPointToLatLng(p);
      if (p.distanceTo(base) > 1)
        L.polyline([original, coordinate], {
          color: "#8b9bb5",
          weight: 1,
        }).addTo(g);
      const popup = document.createElement("div");
      const name = document.createElement("b");
      name.textContent = site.nombre;
      const total = document.createElement("p");
      total.textContent = `${site.total.toLocaleString("es-MX")} toallas · ${site.count} donaciones`;
      popup.append(name, total);
      L.circleMarker(coordinate, {
        radius: 4,
        color: "white",
        weight: 1.5,
        fillColor: "#b2935d",
        fillOpacity: 1,
      })
        .bindPopup(popup)
        .addTo(g);
    }
  }, [sites]);
  return (
    <div className="metro-inset">
      <div className="metro-title">CDMX Y ESTADO DE MÉXICO</div>
      <div ref={host} className="metro-map" />
      <span>Puntos cercanos separados para facilitar su selección</span>
    </div>
  );
}

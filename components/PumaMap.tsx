"use client";
import { useEffect, useRef } from "react";
export default function PumaMap() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.defaultMuted = true;
    element.muted = true;
    void element.play().catch(() => {});
    return () => element.pause();
  }, []);
  return (
    <video
      ref={video}
      className="puma-map"
      src="/videos/Puma_transparente_mapa.webm"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-label="Puma animada de Salud UNAM"
      onVolumeChange={(e) => {
        if (!e.currentTarget.muted) e.currentTarget.muted = true;
      }}
    />
  );
}

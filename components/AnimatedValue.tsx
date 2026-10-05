"use client";
import { useEffect, useRef, useState } from "react";
export default function AnimatedValue({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(value ?? 0),
    current = useRef(value ?? 0);
  useEffect(() => {
    if (value === null) return;
    const from = current.current,
      start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      current.current = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      setDisplay(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{value === null ? "—" : display.toLocaleString("es-MX")}</>;
}

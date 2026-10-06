"use client";
import { useEffect, useRef, useState } from "react";
export default function DonationCounter({ total }: { total: number | null }) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  const previous = useRef(total);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const increase = previous.current !== null && total !== null && total > previous.current;
    previous.current = total; setPulse(increase);
    const timer = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(timer);
  }, [total]);
  useEffect(() => {
    if (total === null) return;
    const start = performance.now(),
      from = current.current;
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      current.current = Math.round(
        from + (total - from) * (1 - Math.pow(1 - p, 3)),
      );
      setValue(current.current);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [total]);
  return (
    <div className={`counter ${pulse ? "counter-donation-pulse" : ""}`}>
      <span className="eyebrow">JUNTAS Y JUNTOS SUMAMOS</span>
      <strong>{total === null ? "—" : value.toLocaleString("es-MX")}</strong>
      <span>TOALLAS FEMENINAS DONADAS</span>
      <div className="counter-line" />
      <p>
        Cada donación cuenta<span className="heart"> ♥</span>
      </p>
    </div>
  );
}

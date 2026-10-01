"use client";
import { useEffect, useRef, useState } from "react";
import type { Donation } from "@/lib/types";
import { fireworks } from "./Fireworks";
export default function DonationCelebration({
  donation,
  onDone,
}: {
  donation: Donation;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(0);
  const done = useRef(false);
  const callback = useRef(onDone);
  callback.current = onDone;
  useEffect(() => {
    done.current = false;
    setStage(0);
    const timers = [
      setTimeout(() => {
        setStage(1);
        fireworks();
      }, 2000),
      setTimeout(() => setStage(2), 5000),
      setTimeout(() => finish(), 45000),
    ];
    function finish() {
      if (done.current) return;
      done.current = true;
      fireworks();
      callback.current();
    }
    return () => timers.forEach(clearTimeout);
  }, [donation.id]);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    fireworks();
    callback.current();
  };
  return (
    <div className={"celebration stage-" + stage} aria-live="polite">
      {stage === 0 ? (
        <div className="new-donation">¡NUEVA DONACIÓN!</div>
      ) : stage === 1 ? (
        <div className="thank-card">
          <span className="eyebrow">UNA COMUNIDAD QUE CUIDA</span>
          <h2>¡GRACIAS!</h2>
          <h3>{donation.site_name}</h3>
          <strong>
            +{donation.quantity.toLocaleString("es-MX")} <small>TOALLAS</small>
          </strong>
          <p>Cada donación cuenta 💜</p>
        </div>
      ) : (
        <video
          src="/videos/gracias.mp4"
          autoPlay
          muted
          playsInline
          onEnded={finish}
          onError={finish}
          ref={(el) => {
            if (el) {
              el.muted = true;
              void el.play().catch(finish);
            }
          }}
        />
      )}
    </div>
  );
}

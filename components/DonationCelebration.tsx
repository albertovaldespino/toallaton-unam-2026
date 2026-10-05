"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Donation } from "@/lib/types";
import { fireworks } from "./Fireworks";
export default function DonationCelebration({
  donation,
  onDone,
}: {
  donation: Donation | null;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(0),
    [blocked, setBlocked] = useState(false);
  const video = useRef<HTMLVideoElement>(null),
    done = useRef(false),
    callback = useRef(onDone),
    current = useRef(donation),
    lastProgress = useRef(0),
    blockedRef = useRef(false);
  callback.current = onDone;
  current.current = donation;
  const finish = useCallback(() => {
    if (done.current || !current.current) return;
    done.current = true;
    video.current?.pause();
    setStage(0);
    setBlocked(false);
    fireworks();
    callback.current();
  }, []);
  const play = useCallback(() => {
    const element = video.current;
    if (!element || !current.current || done.current) return;
    setBlocked(false);
    blockedRef.current = false;
    const id = current.current.id;
    lastProgress.current = Date.now();
    void element.play().catch((error) => {
      if (current.current?.id !== id || done.current) return;
      if (error.name === "NotAllowedError") {
        blockedRef.current = true;
        setBlocked(true);
      } else if (error.name !== "AbortError") finish();
    });
  }, [finish]);
  useEffect(() => {
    const element = video.current;
    done.current = false;
    setStage(0);
    setBlocked(false);
    if (element) {
      element.pause();
      element.currentTime = 0;
    }
    if (!donation) return;
    const timers = [
      setTimeout(() => {
        setStage(1);
        fireworks();
      }, 2000),
      setTimeout(() => setStage(2), 5000),
    ];
    return () => {
      timers.forEach(clearTimeout);
      element?.pause();
    };
  }, [donation?.id]);
  useEffect(() => {
    if (stage !== 2 || !donation) return;
    play();
    const stall = setInterval(() => {
      if (
        !blockedRef.current &&
        !document.hidden &&
        Date.now() - lastProgress.current > 60000
      )
        finish();
    }, 5000);
    return () => clearInterval(stall);
  }, [stage, donation?.id, play, finish]);
  return (
    <div
      className={
        "celebration stage-" + stage + (!donation ? " celebration-idle" : "")
      }
      aria-live="polite"
      aria-hidden={!donation}
    >
      {donation && stage === 0 && (
        <div className="new-donation">¡NUEVA DONACIÓN!</div>
      )}
      {donation && stage === 1 && (
        <div className="thank-card">
          <span className="eyebrow">UNA COMUNIDAD QUE CUIDA</span>
          <h2>¡GRACIAS!</h2>
          <h3>{donation.site_name}</h3>
          <strong>
            +{donation.quantity.toLocaleString("es-MX")} <small>TOALLAS</small>
          </strong>
          <p>Cada donación cuenta 💜</p>
        </div>
      )}
      <video
        ref={video}
        className={stage === 2 && donation ? "" : "celebration-video-hidden"}
        src="/videos/gracias-donacion-queen.mp4"
        autoPlay={!!donation && stage === 2}
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        onTimeUpdate={() => {
          lastProgress.current = Date.now();
        }}
      />
      {blocked && donation && stage === 2 && (
        <div className="audio-permission">
          <p>El navegador bloqueó la reproducción con sonido.</p>
          <button className="button" onClick={play}>
            Reproducir agradecimiento con audio
          </button>
          <p>
            Autoriza la reproducción automática en este navegador para las
            siguientes donaciones.
          </p>
        </div>
      )}
    </div>
  );
}

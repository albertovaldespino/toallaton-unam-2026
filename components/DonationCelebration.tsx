"use client";
import {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Donation } from "@/lib/types";
import { fireworks } from "./Fireworks";
export type CelebrationHandle = { activateSound: () => Promise<boolean> };
const DonationCelebration = forwardRef<
  CelebrationHandle,
  { donation: Donation | null; onDone: () => void }
>(function DonationCelebration({ donation, onDone }, ref) {
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
  useImperativeHandle(
    ref,
    () => ({
      async activateSound() {
        const element = video.current;
        if (!element) return false;
        if (current.current && stage === 2) {
          play();
          return true;
        }
        // Prime this same media element in the click handler, then immediately pause.
        // Never let Queen play outside a donation or change mute/volume to unlock it.
        const activation = element.play();
        element.pause();
        element.currentTime = 0;
        try {
          await activation;
          return true;
        } catch (error) {
          return (error as DOMException).name === "AbortError";
        }
      },
    }),
    [stage, play],
  );
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
      {donation && stage === 2 && (
        <div className="celebration-sparkles" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              style={{
                left: `${8 + i * 9}%`,
                top: `${12 + ((i * 17) % 74)}%`,
                animationDelay: `${i * 0.24}s`,
              }}
            >
              {i % 3 === 0 ? "♡" : "✦"}
            </span>
          ))}
        </div>
      )}
      <video
        ref={video}
        className={stage === 2 && donation ? "" : "celebration-video-hidden"}
        src="/videos/gracias-donacion-queen-transparente.webm"
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
        <button
          className="audio-recovery"
          onClick={play}
          title="El navegador requiere una interacción para reproducir con sonido"
        >
          🔊 Reproducir con sonido
        </button>
      )}
    </div>
  );
});
export default DonationCelebration;

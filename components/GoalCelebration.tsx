"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
export default function GoalCelebration({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvas.current) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const launch = confetti.create(canvas.current, {
      resize: true,
      useWorker: true,
    });
    const burst = () => {
      if (media.matches || document.hidden) return;
      for (const x of [0.08, 0.92])
        void launch({
          particleCount: 25,
          spread: 100,
          startVelocity: 32,
          ticks: 150,
          origin: { x, y: 0.55 },
          colors: ["#e65376", "#b2935d", "#ffffff", "#f7a4c4"],
          disableForReducedMotion: true,
        });
    };
    burst();
    const timer = setInterval(burst, 2400);
    return () => {
      clearInterval(timer);
      launch.reset();
    };
  }, [active]);
  return active ? (
    <canvas ref={canvas} className="goal-fireworks" aria-hidden="true" />
  ) : null;
}

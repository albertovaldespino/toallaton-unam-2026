"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
export default function GoalCelebration({ active, total = 0 }: { active: boolean; total?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const extra = useRef<(() => void) | null>(null);
  const previous = useRef(total);
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
          particleCount: 45,
          spread: 100,
          startVelocity: 38,
          ticks: 150,
          origin: { x, y: 0.24 },
          colors: ["#e65376", "#d5ad55", "#ffffff", "#f7a4c4", "#9ad5cd"],
          disableForReducedMotion: true,
        });
    };
    extra.current = burst;
    burst();
    const fall = setInterval(() => {
      if (media.matches || document.hidden) return;
      void launch({ particleCount: 12, startVelocity: 3, spread: 160, ticks: 220, gravity: 0.45, origin: { x: Math.random(), y: 0 }, colors: ["#d5ad55", "#e65376", "#55c6bf", "#ffffff"], disableForReducedMotion: true });
    }, 900);
    const timer = setInterval(burst, 2400);
    return () => {
      clearInterval(timer);
      clearInterval(fall);
      extra.current = null;
      launch.reset();
    };
  }, [active]);
  useEffect(() => {
    if (active && total > previous.current) extra.current?.();
    previous.current = total;
  }, [active, total]);
  return active ? (
    <canvas ref={canvas} className="goal-fireworks" aria-hidden="true" />
  ) : null;
}

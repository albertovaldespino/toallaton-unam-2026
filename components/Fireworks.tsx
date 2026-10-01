import confetti from "canvas-confetti";
export function fireworks() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const x of [0.15, 0.5, 0.85])
    void confetti({
      particleCount: 90,
      spread: 95,
      origin: { x, y: 0.65 },
      colors: ["#c7a76c", "#ee5776", "#728ac8", "#ffffff"],
      zIndex: 1100,
      disableForReducedMotion: true,
    });
}

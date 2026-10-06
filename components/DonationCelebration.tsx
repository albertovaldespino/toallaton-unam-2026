"use client";
import { forwardRef, useImperativeHandle, useCallback, useEffect, useRef, useState } from "react";
import type { Donation } from "@/lib/types";
export type CelebrationHandle = { activateSound: () => Promise<boolean> };
const DonationCelebration = forwardRef<CelebrationHandle, {
  donation: Donation | null; onDone: () => void; onPlaybackChange?: (playing: boolean) => void;
}>(function DonationCelebration({ donation, onDone, onPlaybackChange }, ref) {
  const [phase, setPhase] = useState<"waiting" | "playing" | "leaving">("waiting");
  const [blocked, setBlocked] = useState(false);
  const video = useRef<HTMLVideoElement>(null), done = useRef(false), current = useRef(donation);
  const callback = useRef(onDone), playback = useRef(onPlaybackChange);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProgress = useRef(0);
  current.current = donation; callback.current = onDone; playback.current = onPlaybackChange;
  const finish = useCallback(() => {
    if (done.current || !current.current) return;
    done.current = true; video.current?.pause(); playback.current?.(false);
    setBlocked(false); setPhase("leaving");
    exitTimer.current = setTimeout(() => callback.current(), 300);
  }, []);
  const play = useCallback(async () => {
    if (!video.current || !current.current || done.current) return false;
    const id = current.current.id;
    setBlocked(false); lastProgress.current = Date.now();
    try { await video.current.play(); return true; }
    catch (error) {
      if (current.current?.id !== id || done.current) return false;
      if ((error as DOMException).name === "NotAllowedError") setBlocked(true);
      else if ((error as DOMException).name !== "AbortError") finish();
      return false;
    }
  }, [finish]);
  useImperativeHandle(ref, () => ({ async activateSound() {
    const element = video.current; if (!element) return false;
    if (current.current && phase === "playing") return play();
    const attempt = element.play(); element.pause(); element.currentTime = 0;
    try { await attempt; return true; } catch (error) { return (error as DOMException).name === "AbortError"; }
  }}), [phase, play]);
  useEffect(() => {
    const element = video.current;
    done.current = false; setPhase("waiting"); setBlocked(false);
    element?.pause(); playback.current?.(false);
    if (element) element.currentTime = 0;
    if (!donation) return;
    // Let the shared counters update before the video enters.
    const timer = setTimeout(() => setPhase("playing"), 600);
    return () => { clearTimeout(timer); if (exitTimer.current) clearTimeout(exitTimer.current); element?.pause(); playback.current?.(false); };
  }, [donation?.id]);
  useEffect(() => {
    if (phase !== "playing" || !donation) return;
    void play();
    const stall = setInterval(() => { if (!document.hidden && Date.now() - lastProgress.current > 60000) finish(); }, 5000);
    return () => clearInterval(stall);
  }, [phase, donation?.id, play, finish]);
  useEffect(() => {
    if (!blocked) return;
    // Give the operator a recovery opportunity without holding the queue forever.
    const timer = setTimeout(finish, 15000); return () => clearTimeout(timer);
  }, [blocked, finish]);
  const visible = !!donation && phase !== "waiting";
  return <div className={`celebration donation-party ${visible ? `party-${phase}` : "celebration-idle"}`} aria-hidden={!visible}>
    {donation && phase === "playing" && !blocked && <div key={donation.id} className="donation-particles" aria-hidden="true">
      {Array.from({length:84},(_,i)=><i key={i} className="party-confetti" style={{left:`${2+(i*37)%96}%`,width:`${4+i%5}px`,height:`${8+i%7}px`,animationDelay:`${(i%9)*.09}s`,animationDuration:`${3.6+(i%6)*.13}s`,background:["#ed6296","#c32985","#e6bf61","#52c9bd","#ffffff","#294b88"][i%6]}} />)}
      {Array.from({length:10},(_,i)=><i key={`star${i}`} className="party-star" style={{left:i%2?"91%":"7%",top:`${16+Math.floor(i/2)*15}%`,width:`${18+(i%3)*8}px`,height:`${18+(i%3)*8}px`,animationDelay:`${i*.08}s`}} />)}
      {Array.from({length:6},(_,i)=><span key={`burst${i}`} className="party-burst" style={{left:i%2?"91%":"9%",top:`${14+Math.floor(i/2)*29}%`,animationDelay:`${i*.57}s`}}>{Array.from({length:16},(_,j)=><i key={j} style={{transform:`rotate(${j*22.5}deg) translateY(-22px)`,background:["#ed6296","#c32985","#e6bf61","#52c9bd","#ffffff","#294b88"][j%6]}} />)}</span>)}
      <div className="party-initial-burst">{Array.from({length:16},(_,i)=><i key={i} style={{transform:`rotate(${i*22.5}deg) translateY(-65px)`}} />)}</div>
    </div>}
    <video ref={video} className={visible ? "donation-thanks-video" : "celebration-video-hidden"}
      src="/videos/Toallaton_Gracias_Puma_Aplausos_CORREGIDO.webm" playsInline preload="auto"
      onPlaying={() => { if (current.current && !done.current) playback.current?.(true); }}
      onPause={() => playback.current?.(false)} onEnded={finish} onError={finish}
      onTimeUpdate={() => { lastProgress.current = Date.now(); }} />
    {blocked && visible && <button className="audio-recovery" onClick={() => void play()}>🔊 Reproducir con sonido</button>}
  </div>;
});
export default DonationCelebration;

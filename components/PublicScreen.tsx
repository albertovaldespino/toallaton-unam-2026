"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, MapPin, Heart, Wifi } from "lucide-react";
import Brand from "@/components/Brand";
import GoalProgress from "@/components/GoalProgress";
import GoalAudio, { type GoalAudioHandle } from "@/components/GoalAudio";
import GoalCelebration from "@/components/GoalCelebration";
import { DONATION_GOAL, PUBLIC_DONATION_GOAL } from "@/lib/goal";
import DonationCounter from "@/components/DonationCounter";
import DonationCelebration, {
  type CelebrationHandle,
} from "@/components/DonationCelebration";
import { sedes } from "@/data/sedes";
import type { Donation, Stats } from "@/lib/types";
const Map = dynamic(() => import("@/components/DonationMap"), { ssr: false });
const initialSites = sedes.map((s) => ({ ...s, total: 0, count: 0 }));
export default function PublicScreen({ vertical = false }: { vertical?: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null),
    [offline, setOffline] = useState(false),
    [songRequested, setSongRequested] = useState(false),
    [active, setActive] = useState<Donation | null>(null),
    [controls, setControls] = useState(true),
    [soundEnabled, setSoundEnabled] = useState(false),
    [celebrationPlaying, setCelebrationPlaying] = useState(false);
  const celebration = useRef<CelebrationHandle>(null);
  const goalAudio = useRef<GoalAudioHandle>(null);
  useEffect(() => {
    try {
      setSongRequested(sessionStorage.getItem("toallaton-next-donation-song-triggered") === "true");
    } catch {}
  }, []);
  async function activateSound() {
    const enabled = await Promise.all([celebration.current?.activateSound(), goalAudio.current?.activateSound()]);
    if (enabled.every(Boolean)) {
      setSoundEnabled(true);
      try {
        sessionStorage.setItem("toallaton-celebration-sound", "enabled");
      } catch {}
    }
  }
  const queue = useRef<Donation[]>([]),
    busy = useRef(false),
    cursor = useRef<string | null>(null),
    songBaseline = useRef<string | null>(null),
    hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  const next = useCallback(() => {
    const item = queue.current.shift();
    busy.current = !!item;
    setActive(item || null);
  }, []);
  useEffect(() => {
    try {
      const cached = localStorage.getItem("toallaton-stats");
      if (cached) setStats(JSON.parse(cached));
      const saved = JSON.parse(
        localStorage.getItem("toallaton-playback") || "null",
      );
      if (saved) {
        cursor.current = saved.cursor;
        queue.current = saved.queue || [];
        if (queue.current.length) next();
      }
    } catch {}
    let stopped = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const failures = [false, false];
    async function pollEvents() {
      let response: Response;
      if (songBaseline.current === null) {
        const baseline = await fetch("/api/donations/latest", { cache: "no-store" });
        if (!baseline.ok) throw Error();
        songBaseline.current = (await baseline.clone().json()).cursor;
        response = cursor.current === null ? baseline : await fetch(`/api/donations/latest?after=${cursor.current}`, { cache: "no-store" });
      } else {
        response = await fetch(`/api/donations/latest?after=${cursor.current}`, { cache: "no-store" });
      }
      if (!response.ok) throw Error();
      const data = await response.json();
      if (stopped) return;
      const newEvents = data.events.filter((event: Donation) =>
        cursor.current !== null && BigInt(event.sequence) > BigInt(cursor.current),
      );
      if (newEvents.some((event: Donation) => BigInt(event.sequence) > BigInt(songBaseline.current!))) {
        setSongRequested(true);
        try { sessionStorage.setItem("toallaton-next-donation-song-triggered", "true"); } catch {}
      }
      queue.current.push(...newEvents);
      cursor.current = data.cursor;
      localStorage.setItem("toallaton-playback", JSON.stringify({ cursor: data.cursor, queue: queue.current }));
      if (!busy.current && queue.current.length) next();
    }
    async function pollStats() {
      const response = await fetch("/api/stats", { cache: "no-store" });
      if (!response.ok) throw Error();
      const summary = await response.json();
      if (stopped) return;
      setStats(summary);
      localStorage.setItem("toallaton-stats", JSON.stringify(summary));
    }
    async function poll(action: () => Promise<void>, channel: number) {
      try { await action(); failures[channel] = false; }
      catch { failures[channel] = true; }
      if (!stopped) {
        setOffline(failures.some(Boolean));
        timers[channel] = setTimeout(() => void poll(action, channel), 1000);
      }
    }
    void poll(pollEvents, 0);
    void poll(pollStats, 1);
    return () => {
      stopped = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [next]);
  useEffect(() => {
    if (active) {
      localStorage.setItem("lastProcessedDonationId", active.id);
      localStorage.setItem(
        "toallaton-playback",
        JSON.stringify({ cursor: cursor.current, queue: queue.current }),
      );
    }
  }, [active]);
  function mouse() {
    setControls(true);
    if (hide.current) clearTimeout(hide.current);
    hide.current = setTimeout(() => setControls(false), 3000);
  }
  useEffect(() => {
    mouse();
    return () => {
      if (hide.current) clearTimeout(hide.current);
    };
  }, []);
  return (
    <main
      className={
        "screen" + (vertical ? " screen-vertical" : "") +
        ((stats?.total ?? 0) >= PUBLIC_DONATION_GOAL ? " screen-goal-reached" : "")
      }
      onMouseMove={mouse}
      onTouchStart={mouse}
    >
      <GoalAudio ref={goalAudio} reached={songRequested} />
      <GoalCelebration active={(stats?.total ?? 0) >= DONATION_GOAL} total={stats?.total ?? 0} />
      <header className="screen-header">
        <Brand />
        <div className="event-label">
          SALUD MENSTRUAL
          <br />
          <b>UN COMPROMISO DE TODAS Y TODOS</b>
        </div>
        <button
          className="celebration-sound-control"
          onClick={() => void activateSound()}
          aria-pressed={soundEnabled}
        >
          🔊{" "}
          {soundEnabled ? "Sonido activado" : "Activar sonido de celebraciones"}
        </button>
        <div className={"connection " + (offline ? "disconnected" : "")}>
          <span />
          {offline ? "Reconectando" : stats ? "En vivo" : "Conectando"}
        </div>
      </header>
      <section className="screen-title">
        <div>
          <div className="eyebrow gold">SOLIDARIDAD QUE TRANSFORMA</div>
          <h1>
            TOALLATÓN <span>UNAM 2026</span>
          </h1>
          <p>Sumando voluntades por la salud menstrual</p>
        </div>
        <div className="edition">
          01
          <span>
            UNA CAUSA.
            <br />
            TODA UNA COMUNIDAD.
          </span>
        </div>
      </section>
      <section className="event-grid">
        <aside className="total-panel">
          <DonationCounter total={stats?.total ?? null} />
          <GoalProgress total={stats?.total ?? null} eventMode />
          <div className="small-stats">
            <div>
              <MapPin size={20} />
              <strong>{stats?.sites.length ?? 17}</strong>
              <span>sedes unidas</span>
            </div>
            <div>
              <Heart size={20} />
              <strong>{stats?.count.toLocaleString("es-MX") ?? "—"}</strong>
              <span>donaciones</span>
            </div>
          </div>
          <div className="latest">
            <span className="eyebrow">ÚLTIMA APORTACIÓN</span>
            {stats?.latest ? (
              <>
                <h3>{stats.latest.site_name}</h3>
                <p>
                  +{stats.latest.quantity.toLocaleString("es-MX")} toallas{" "}
                  <span className="latest-donor">
                    Donativo: {stats.latest.donor?.trim() || "Anónimo"}
                  </span>
                  <span>¡Gracias por sumar!</span>
                </p>
              </>
            ) : (
              <p>
                {offline
                  ? "Esperando conexión con los registros"
                  : "La próxima aportación empieza contigo"}
              </p>
            )}
          </div>
          <div className="public-leader">
            Sede líder:{" "}
            <b>
              {stats?.sites.find((s) => s.total > 0)?.nombreCorto ||
                "Por comenzar"}
            </b>
          </div>
          <div className="cause">
            <Heart size={17} /> Por una menstruación digna.
          </div>
        </aside>
        <section className="map-panel">
          <div className="map-heading">
            <div>
              <span className="eyebrow">NUESTRA RED SOLIDARIA</span>
              <h2>LA UNAM NOS UNE</h2>
            </div>
            <span className="map-key">
              <i /> Sedes participantes
            </span>
          </div>
          <Map sites={stats?.sites || initialSites} active={active} paused={celebrationPlaying} />
          {(stats?.total ?? 0) >= PUBLIC_DONATION_GOAL && (
            <div className="goal-banner" role="status">
              <strong>¡META ALCANZADA!</strong>
              <span className="goal-milestone">{PUBLIC_DONATION_GOAL.toLocaleString("es-MX")} <small>TOALLAS</small></span>
              <em>¡GRACIAS, COMUNIDAD UNAM!</em>
              <p className="goal-community">JUNTAS Y JUNTOS, LA UNAM LO HIZO POSIBLE</p>
              {stats!.total > PUBLIC_DONATION_GOAL && (
                <b>
                  TOTAL ALCANZADO · {stats!.total.toLocaleString("es-MX")}{" "}
                  TOALLAS
                </b>
              )}
            </div>
          )}
          <div className="map-caption">
            <MapPin size={15} /> Selecciona una sede para conocer sus
            aportaciones
          </div>
          <DonationCelebration
            ref={celebration}
            donation={active}
            onDone={next}
            onPlaybackChange={setCelebrationPlaying}
          />
        </section>
      </section>
      <footer className="screen-footer">
        <span>UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO</span>
        <span>
          Tu solidaridad llega más lejos. <b>Cada donación cuenta.</b>
        </span>
        <button
          className={controls ? "fullscreen" : "fullscreen hidden"}
          onClick={() => {
            if (!document.fullscreenElement)
              void document.documentElement
                .requestFullscreen?.()
                .catch(() => {});
            else void document.exitFullscreen();
          }}
        >
          <Maximize size={15} /> Pantalla completa
        </button>
      </footer>
      {offline && (
        <div className="offline-note">
          <Wifi size={14} /> Sin conexión con los registros. Conservamos los
          últimos datos disponibles.
        </div>
      )}
    </main>
  );
}

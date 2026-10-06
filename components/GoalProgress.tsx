"use client";
import { useEffect, useRef, useState } from "react";
import { DONATION_GOAL, goalProgress } from "@/lib/goal";
import AnimatedValue from "./AnimatedValue";
export default function GoalProgress({
  total,
  eventMode = false,
}: {
  total: number | null;
  eventMode?: boolean;
}) {
  const progress = goalProgress(total ?? 0),
    fmt = (n: number) => n.toLocaleString("es-MX");
  const previous = useRef(total),
    [growing, setGrowing] = useState(false);
  useEffect(() => {
    const increased =
      previous.current !== null && total !== null && total > previous.current;
    previous.current = total;
    if (!increased) {
      setGrowing(false);
      return;
    }
    setGrowing(true);
    const timer = setTimeout(() => setGrowing(false), 1200);
    return () => clearTimeout(timer);
  }, [total]);
  if (eventMode)
    return (
      <section
        className={`goal-progress event-goal ${progress.reached ? "goal-reached" : ""} ${growing ? "goal-growing" : ""}`}
        aria-label="Meta general"
      >
        <div className="event-goal-heading">
          <div>
            <span>META</span>
            <strong>{fmt(DONATION_GOAL)}</strong>
          </div>
          <b>
            {total === null
              ? "—"
              : progress.percent.toLocaleString("es-MX", {
                  maximumFractionDigits: 1,
                })}
            <small>%</small><small className="advance-label">AVANCE</small>
          </b>
        </div>
        <div
          className="goal-track"
          role="progressbar"
          aria-label={`Avance hacia ${fmt(DONATION_GOAL)} toallas`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={total === null ? undefined : progress.percent}
        >
          <div style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="event-goal-counts">
          <div>
            <span>LLEVAMOS</span>
            <strong>
              <AnimatedValue value={total} />
            </strong>
          </div>
          <div>
            <span>NOS FALTAN</span>
            <strong>
              <AnimatedValue
                value={total === null ? null : progress.remaining}
              />
            </strong>
          </div>
        </div>
        <div className="goal-pad-marks" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i
              key={i}
              style={{ animationDelay: `${i * 0.18}s` }}
              className={progress.percent >= (i + 1) * 10 ? "filled" : ""}
            >
              <svg viewBox="0 0 20 30">
                <path d="M6 3Q10 0 14 3L14 9L18 12L18 18L14 21L14 27Q10 30 6 27L6 21L2 18L2 12L6 9Z" />
                <path d="M10 7V23" />
              </svg>
            </i>
          ))}
        </div>
        {progress.reached && (
          <p className="goal-status">
            META SUPERADA
          </p>
        )}
      </section>
    );
  return (
    <section
      className={"goal-progress " + (progress.reached ? "goal-reached" : "")}
      aria-label="Meta general"
    >
      <div className="goal-numbers">
        <div>
          <span>META</span>
          <strong>{fmt(DONATION_GOAL)}</strong>
        </div>
        <div>
          <span>
            {progress.exceeded
              ? "META SUPERADA"
              : progress.reached
                ? "¡META ALCANZADA!"
                : "NOS FALTAN"}
          </span>
          <strong>
            {total === null
              ? "—"
              : progress.reached
                ? fmt(progress.total)
                : fmt(progress.remaining)}{" "}
            <small>toallas</small>
          </strong>
        </div>
      </div>
      <div
        className="goal-track"
        role="progressbar"
        aria-label={`Avance hacia ${fmt(DONATION_GOAL)} toallas`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={total === null ? undefined : progress.percent}
      >
        <div style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="goal-caption">
        <span>
          {total === null
            ? "Esperando datos"
            : `${fmt(progress.total)} / ${fmt(DONATION_GOAL)}`}
        </span>
        <b>
          {total === null
            ? "—"
            : `${progress.percent.toLocaleString("es-MX", { maximumFractionDigits: 1 })}%`}
        </b>
      </div>
    </section>
  );
}

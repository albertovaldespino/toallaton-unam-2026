import { DONATION_GOAL, goalProgress } from "@/lib/goal";
export default function GoalProgress({ total }: { total: number | null }) {
  const progress = goalProgress(total ?? 0),
    fmt = (n: number) => n.toLocaleString("es-MX");
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
        aria-label="Avance hacia 12,001 toallas"
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

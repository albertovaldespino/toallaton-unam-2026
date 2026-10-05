"use client";
import { useMemo, useState } from "react";
import type { Donation } from "@/lib/types";
import type { Site } from "@/data/sedes";
import { donationDashboard } from "@/lib/dashboard";
import { DONATION_GOAL, goalProgress } from "@/lib/goal";
import GoalProgress from "./GoalProgress";
const fmt = (n: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: 1 });
const date = (v: string | null) =>
  v
    ? new Date(v).toLocaleDateString("es-MX", {
        timeZone: "America/Mexico_City",
      })
    : "—";
const time = (v: string) =>
  new Date(v).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
export default function AdminDashboard({
  donations,
  sites,
}: {
  donations: Donation[];
  sites: Site[];
}) {
  const data = useMemo(
    () => donationDashboard(donations, sites),
    [donations, sites],
  );
  const progress = goalProgress(data.total),
    [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(donations.length / 50)),
    current = Math.min(page, pages - 1);
  const latest = donations[0],
    max = Math.max(1, ...data.sites.map((s) => s.total));
  const points = data.days
    .map(
      (d, i) =>
        `${40 + (data.days.length === 1 ? 0 : i / (data.days.length - 1)) * 600},${170 - (d.total / Math.max(1, data.total)) * 145}`,
    )
    .join(" ");
  return (
    <section
      className="dashboard"
      id="dashboard"
      aria-labelledby="dashboard-title"
    >
      <div className="history-heading">
        <div>
          <span className="eyebrow">TOALLATÓN UNAM 2026</span>
          <h2 id="dashboard-title">DASHBOARD</h2>
        </div>
        <button
          className="outline-button no-print"
          onClick={() => window.print()}
        >
          Generar informe
        </button>
      </div>
      <p className="dashboard-note">
        Información de todos los registros vigentes · Horario de Ciudad de
        México
      </p>
      <div className="metrics dashboard-metrics">
        {[
          ["Total de toallas", fmt(data.total)],
          ["Donaciones", fmt(data.count)],
          ["Sedes participantes", fmt(sites.length)],
          ["Promedio por donación", fmt(data.average)],
          [
            "Sede líder",
            data.sites.find((s) => s.total > 0)?.nombreCorto || "Por comenzar",
          ],
          [
            "Última donación",
            latest
              ? `+${fmt(latest.quantity)} · ${latest.site_name} · ${date(latest.created_at)} ${time(latest.created_at)}`
              : "Sin registros",
          ],
          ["Avance a la meta", `${fmt(progress.percent)}%`],
          ["Toallas faltantes", fmt(progress.remaining)],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong className={value.length > 16 ? "metric-text" : ""}>
              {value}
            </strong>
          </article>
        ))}
      </div>
      <div className="dashboard-charts">
        <article className="dashboard-card">
          <h3>Donaciones por sede</h3>
          <div className="site-bars">
            {data.sites.map((s) => (
              <div className="site-bar" key={s.id}>
                <span>{s.nombreCorto}</span>
                <div>
                  <i style={{ width: `${(s.total / max) * 100}%` }} />
                </div>
                <b>{fmt(s.total)}</b>
              </div>
            ))}
          </div>
        </article>
        <article className="dashboard-card">
          <h3>Evolución de toallas donadas</h3>
          {data.days.length ? (
            <>
              <svg
                viewBox="0 0 680 210"
                role="img"
                aria-label={`Evolución acumulada hasta ${fmt(data.total)} toallas`}
              >
                <line x1="40" y1="170" x2="640" y2="170" stroke="#dce2eb" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#294b88"
                  strokeWidth="3"
                />
                {data.days.length === 1 && (
                  <circle cx="40" cy="25" r="5" fill="#294b88" />
                )}
                <text x="40" y="200">
                  {data.days[0].date}
                </text>
                <text x="640" y="200" textAnchor="end">
                  {data.days.at(-1)!.date}
                </text>
                <text x="640" y="17" textAnchor="end">
                  {fmt(data.total)} toallas
                </text>
              </svg>
              <details className="no-print">
                <summary>Ver valores por día</summary>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Toallas</th>
                        <th>Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.days.map((d) => (
                        <tr key={d.date}>
                          <td>{d.date}</td>
                          <td>{fmt(d.quantity)}</td>
                          <td>{fmt(d.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <p className="empty">
              La evolución aparecerá con la primera donación.
            </p>
          )}
          <h3 className="dashboard-goal-title">
            Avance hacia {fmt(DONATION_GOAL)}
          </h3>
          <GoalProgress total={data.total} />
        </article>
      </div>
      <article className="dashboard-card">
        <h3>Acumulado por sede</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sede</th>
                <th>Toallas</th>
                <th>Donaciones</th>
                <th>% del total</th>
                <th>Última aportación · CDMX</th>
              </tr>
            </thead>
            <tbody>
              {data.sites.map((s) => (
                <tr key={s.id}>
                  <td>{s.nombre}</td>
                  <td>{fmt(s.total)}</td>
                  <td>{fmt(s.count)}</td>
                  <td>{fmt(data.total ? (s.total / data.total) * 100 : 0)}%</td>
                  <td>
                    {s.lastDonation
                      ? `${date(s.lastDonation)} ${time(s.lastDonation)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <article className="dashboard-card">
        <h3>Detalle de donaciones · {fmt(donations.length)} registros</h3>
        <div className="table-scroll">
          <table className="donor-detail">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora · CDMX</th>
                <th>Sede</th>
                <th>Cantidad</th>
                <th>Donante / institución</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <tr
                  className={
                    i < current * 50 || i >= (current + 1) * 50
                      ? "print-only-row"
                      : ""
                  }
                  key={d.id}
                >
                  <td>{date(d.created_at)}</td>
                  <td>{time(d.created_at)}</td>
                  <td>{d.site_name}</td>
                  <td>{fmt(d.quantity)}</td>
                  <td>{d.donor?.trim() || "Anónimo"}</td>
                  <td>{d.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!donations.length && (
          <p className="empty">No hay donaciones registradas.</p>
        )}
        <div className="pagination no-print">
          <button
            className="outline-button"
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </button>
          <span>
            Página {current + 1} de {pages}
          </span>
          <button
            className="outline-button"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Siguiente
          </button>
        </div>
      </article>
      <p className="report-footer">
        Informe Toallatón UNAM 2026 · Meta: {fmt(DONATION_GOAL)} toallas ·{" "}
        {fmt(data.total)} registradas · {fmt(progress.remaining)} faltantes.
      </p>
    </section>
  );
}

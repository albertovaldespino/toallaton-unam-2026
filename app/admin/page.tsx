"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  ArrowUpRight,
  Heart,
  MapPin,
  Undo2,
  LockKeyhole,
  X,
  Check,
  LogOut,
} from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import Brand from "@/components/Brand";
import { sedes, type Site } from "@/data/sedes";
import type { Stats, Donation } from "@/lib/types";
const fmt = (n: number) => n.toLocaleString("es-MX");
export default function Admin() {
  const [password, setPassword] = useState(""),
    [key, setKey] = useState(""),
    [stats, setStats] = useState<Stats | null>(null),
    [sites, setSites] = useState<Site[]>(sedes),
    [history, setHistory] = useState<Donation[]>([]),
    [site, setSite] = useState("cmu"),
    [quantity, setQuantity] = useState(""),
    [donor, setDonor] = useState(""),
    [notes, setNotes] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState<"donation" | "undo" | null>(null),
    [addSite, setAddSite] = useState(false),
    [connected, setConnected] = useState(false);
  const pending = useRef<string | null>(null);
  const authRef = useRef(key);
  authRef.current = key;
  const refreshing = useRef(false);
  const selected = sites.find((s) => s.id === site);
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const responses = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/sites"),
        ...(key
          ? [
              fetch("/api/donations?all=1", {
                headers: { "x-admin-password": key },
              }),
            ]
          : []),
      ]);
      const values = await Promise.all(responses.map((r) => r.json()));
      if (authRef.current !== key) return;
      if (responses.some((r) => !r.ok))
        throw Error(values.find((v) => v.error)?.error || "No hay conexión.");
      setStats(values[0]);
      setSites(values[1]);
      if (values[2]) setHistory(values[2]);
      setConnected(true);
      setError("");
    } catch (e) {
      if (authRef.current !== key) return;
      setConnected(false);
      setError((e as Error).message);
    } finally {
      refreshing.current = false;
    }
  }, [key]);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      await refresh();
      if (!stopped) timer = setTimeout(poll, 5000);
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [refresh]);
  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": key },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || "No se pudo guardar.");
    return data;
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      if (confirm === "undo") {
        await request("/api/donations/" + history[0].id, "DELETE");
        setSuccess("Último registro deshecho. Los totales se han actualizado.");
      } else {
        if (!pending.current) pending.current = crypto.randomUUID();
        await request("/api/donations", "POST", {
          id: pending.current,
          site_id: site,
          quantity: Number(quantity),
          donor,
          notes,
        });
        setSuccess(
          `${fmt(Number(quantity))} toallas · ${selected?.nombre}. Donación registrada; la pantalla conectada recibirá el agradecimiento.`,
        );
        pending.current = null;
        setQuantity("");
        setDonor("");
        setNotes("");
      }
      setConfirm(null);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function createSite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const b = Object.fromEntries(form);
    try {
      const saved = await request("/api/sites", "POST", {
        ...b,
        latitud: Number(b.latitud),
        longitud: Number(b.longitud),
      });
      await refresh();
      setSite(saved.id);
      setAddSite(false);
      setSuccess(
        "Nueva sede agregada. Ya está disponible en el mapa y en el registro.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin">
      <header className="admin-header">
        <Brand />
        <div className="admin-links">
          <a href="/pantalla" target="_blank">
            Abrir pantalla <ArrowUpRight size={16} />
          </a>
          {key && (
            <button
              className="text-button"
              onClick={() => {
                setKey("");
                setPassword("");
                setHistory([]);
              }}
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>
      <div className="admin-content">
        <div className="admin-title">
          <div>
            <span className="eyebrow gold">TOALLATÓN UNAM 2026</span>
            <h1>Panel de registro</h1>
            <p>Cada aportación nos acerca a una comunidad más solidaria.</p>
          </div>
          <span className={"connection " + (!connected ? "disconnected" : "")}>
            <span />
            {connected ? "Conectado" : "Sin conexión"}
          </span>
        </div>
        {!key && (
          <form
            className="login"
            onSubmit={(e) => {
              e.preventDefault();
              setKey(password);
            }}
          >
            <LockKeyhole size={19} />
            <label htmlFor="password">Acceso de administración</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave del evento"
              required
            />
            <button className="button">Entrar</button>
          </form>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
            {!connected &&
              " Revisa la integración de Neon y el esquema de la base de datos para habilitar los registros."}
          </div>
        )}
        {success && (
          <div className="notice success" role="status">
            <Check size={18} />
            {success}
            <button onClick={() => setSuccess("")} aria-label="Cerrar aviso">
              <X size={16} />
            </button>
          </div>
        )}
        <section className="metrics">
          <article>
            <span>Total donado</span>
            <strong>
              {stats ? fmt(stats.total) : "—"}
              <small>toallas</small>
            </strong>
          </article>
          <article>
            <span>Donaciones registradas</span>
            <strong>{stats ? fmt(stats.count) : "—"}</strong>
          </article>
          <article>
            <span>Sede con mayor cantidad</span>
            <strong className="metric-text">
              {stats?.sites.find((s) => s.total > 0)?.nombreCorto ||
                "Por comenzar"}
            </strong>
          </article>
          <article>
            <span>Última donación</span>
            <strong>
              {stats?.latest ? "+" + fmt(stats.latest.quantity) : "—"}
              <small>
                {stats?.latest
                  ? new Date(stats.latest.created_at).toLocaleTimeString(
                      "es-MX",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Mexico_City",
                      },
                    )
                  : "Sin registros"}
              </small>
            </strong>
          </article>
        </section>
        <section className="admin-columns">
          <article className="form-card">
            <div className="card-heading">
              <div className="icon-tile">
                <Heart size={23} />
              </div>
              <div>
                <h2>Registrar una donación</h2>
                <p>Sumemos una nueva voluntad.</p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                pending.current = null;
                setConfirm("donation");
              }}
            >
              <div className="label-row">
                <label htmlFor="site">Sede participante</label>
                <button
                  type="button"
                  className="text-button"
                  disabled={!key || !connected}
                  onClick={() => setAddSite(true)}
                >
                  <Plus size={15} /> Agregar sede
                </button>
              </div>
              <select
                id="site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <label htmlFor="quantity">Cantidad de toallas</label>
              <div className="quantity-input">
                <input
                  id="quantity"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="2147483647"
                  step="1"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <span>toallas</span>
              </div>
              <div className="form-row">
                <div>
                  <label htmlFor="donor">
                    Donante / institución <small>Opcional</small>
                  </label>
                  <input
                    id="donor"
                    value={donor}
                    onChange={(e) => setDonor(e.target.value)}
                    maxLength={1000}
                    placeholder="Nombre o institución"
                  />
                </div>
              </div>
              <label htmlFor="notes">
                Observaciones <small>Opcional</small>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                placeholder="Información adicional de la aportación"
                rows={2}
              />
              <button
                className="button primary"
                disabled={!key || !connected || busy}
              >
                <Plus size={19} /> Registrar donación
              </button>
              <p className="form-help">
                Podrás revisar los datos antes de confirmar.
              </p>
            </form>
          </article>
          <aside className="admin-side">
            <span className="eyebrow">SUMANDO VOLUNTADES</span>
            <h2>
              Una pequeña acción.
              <br />
              <em>Un gran impacto.</em>
            </h2>
            <p>
              Gracias por hacer posible una menstruación digna para más
              personas.
            </p>
            <div className="side-art">
              <Heart size={88} strokeWidth={1} />
              <span>2026</span>
            </div>
            <div className="side-bottom">
              <MapPin size={18} />
              <b>{sites.length} sedes</b> unidas por la misma causa
            </div>
            <div className="site-preview">
              <span className="eyebrow">TU SEDE SELECCIONADA</span>
              <h3>{selected?.nombre}</h3>
              <p>
                {selected?.ciudad}, {selected?.estado}
              </p>
            </div>
          </aside>
        </section>
        <section className="history">
          <div className="history-heading">
            <div>
              <span className="eyebrow">EL IMPACTO DE NUESTRA COMUNIDAD</span>
              <h2>Últimas donaciones</h2>
            </div>
            <button
              className="outline-button"
              disabled={!key || !history.length || !connected}
              onClick={() => setConfirm("undo")}
            >
              <Undo2 size={16} /> Deshacer último registro
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>HORA · CDMX</th>
                  <th>SEDE</th>
                  <th>CANTIDAD</th>
                  <th>DONANTE</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 100).map((d) => (
                  <tr key={d.id}>
                    <td>
                      {new Date(d.created_at).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Mexico_City",
                      })}
                    </td>
                    <td>{d.site_name}</td>
                    <td>
                      <b>+{fmt(d.quantity)}</b>
                    </td>
                    <td>{d.donor || "Anónimo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!history.length && (
              <div className="empty">
                <Heart size={26} />
                <p>
                  {key
                    ? "Las donaciones registradas aparecerán aquí."
                    : "Ingresa la clave para consultar el historial."}
                </p>
              </div>
            )}
          </div>
        </section>
        {key && connected && stats && (
          <AdminDashboard donations={history} sites={sites} />
        )}
        <footer className="admin-footer">
          SALUD UNAM <span>Cada donación cuenta.</span>
        </footer>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title">
              {confirm === "undo"
                ? "Deshacer último registro"
                : "Confirmar donación"}
            </h2>
            <p>
              {confirm === "undo" ? history[0]?.site_name : selected?.nombre}
            </p>
            <strong className="confirm-quantity">
              {fmt(
                confirm === "undo"
                  ? history[0]?.quantity || 0
                  : Number(quantity),
              )}{" "}
              <small>toallas</small>
            </strong>
            <p>
              {confirm === "undo"
                ? "Se descontará esta aportación del total y del acumulado de la sede."
                : "Al confirmar se guardará la aportación y se enviará a la pantalla pública."}
            </p>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                autoFocus
                disabled={busy}
                className="outline-button"
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </button>
              <button
                disabled={busy}
                className="button"
                onClick={() => void save()}
              >
                {busy
                  ? "Guardando…"
                  : confirm === "undo"
                    ? "Deshacer registro"
                    : "Confirmar donación"}
              </button>
            </div>
          </section>
        </div>
      )}
      {addSite && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-title"
          >
            <div className="label-row">
              <h2 id="site-title">Agregar sede</h2>
              <button
                className="text-button"
                onClick={() => setAddSite(false)}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <p>La nueva sede aparecerá en el mapa y en el selector.</p>
            <form onSubmit={createSite}>
              <label>
                Nombre de la sede
                <input autoFocus name="nombre" required maxLength={150} />
              </label>
              <label>
                Nombre corto
                <input name="nombreCorto" required maxLength={150} />
              </label>
              <div className="form-row">
                <label>
                  Estado
                  <input name="estado" required maxLength={150} />
                </label>
                <label>
                  Ciudad / alcaldía
                  <input name="ciudad" required maxLength={150} />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Latitud
                  <input
                    type="number"
                    name="latitud"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="19.35"
                    required
                  />
                </label>
                <label>
                  Longitud
                  <input
                    type="number"
                    name="longitud"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="-99.15"
                    required
                  />
                </label>
              </div>
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <button className="button primary" disabled={busy}>
                {busy ? "Guardando…" : "Guardar sede"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

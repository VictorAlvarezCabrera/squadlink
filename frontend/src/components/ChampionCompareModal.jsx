import { useEffect, useMemo, useState } from "react";
import "./ChampionCompareModal.css";

export default function ChampionCompareModal({ ids, onClose }) {
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cerrar con ESC
  useEffect(() => {
    if (!ids?.length) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ids, onClose]);

  // Bloquear scroll body
  useEffect(() => {
    if (!ids?.length) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ids]);

  // Cargar detalles de ambos campeones
  useEffect(() => {
    if (!ids || ids.length !== 2) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setLeft(null);
        setRight(null);

        const [a, b] = ids;

        const [ra, rb] = await Promise.all([
          fetch(`http://localhost:3001/api/champions/${a}`),
          fetch(`http://localhost:3001/api/champions/${b}`),
        ]);

        if (!ra.ok) throw new Error(`Error ${ra.status}: No se pudo cargar el campeón A`);
        if (!rb.ok) throw new Error(`Error ${rb.status}: No se pudo cargar el campeón B`);

        const [ja, jb] = await Promise.all([ra.json(), rb.json()]);

        if (!ja.ok) throw new Error(ja?.error || "Error cargando campeón A");
        if (!jb.ok) throw new Error(jb?.error || "Error cargando campeón B");

        if (!cancelled) {
          setLeft(ja.champion);
          setRight(jb.champion);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const statKeys = useMemo(() => {
    const a = left?.stats || {};
    const b = right?.stats || {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

    // Orden “bonito”: primero los importantes y luego el resto alfabético
    const priority = [
      "hp",
      "hpperlevel",
      "mp",
      "mpperlevel",
      "armor",
      "armorperlevel",
      "spellblock",
      "spellblockperlevel",
      "attackdamage",
      "attackdamageperlevel",
      "attackspeed",
      "attackspeedperlevel",
      "attackrange",
      "movespeed",
      "hpregen",
      "hpregenperlevel",
      "mpregen",
      "mpregenperlevel",
      "crit",
      "critperlevel",
    ];

    const existingPriority = priority.filter((k) => keys.has(k));
    const rest = Array.from(keys)
      .filter((k) => !existingPriority.includes(k))
      .sort((x, y) => x.localeCompare(y));

    return [...existingPriority, ...rest];
  }, [left, right]);

  if (!ids || ids.length !== 2) return null;

  return (
    <div className="ccm-overlay" onMouseDown={onClose}>
      <div className="ccm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ccm-header">
          <div className="ccm-title">Comparar campeones</div>
          <button className="ccm-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {loading && <div className="ccm-state">Cargando comparación...</div>}

        {!loading && error && (
          <div className="ccm-state ccm-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && left && right && (
          <div className="ccm-content">
            <div className="ccm-heroes">
              <HeroCard champ={left} />
              <HeroCard champ={right} />
            </div>

            <section className="ccm-section">
              <h3 className="ccm-section-title">Stats base</h3>

              <div className="ccm-table">
                <div className="ccm-row ccm-head">
                  <div className="ccm-cell ccm-statname">Stat</div>
                  <div className="ccm-cell ccm-val">{left.name}</div>
                  <div className="ccm-cell ccm-val">{right.name}</div>
                  <div className="ccm-cell ccm-diff">Diferencia</div>
                </div>

                {statKeys.map((k) => {
                  const av = numOrNull(left.stats?.[k]);
                  const bv = numOrNull(right.stats?.[k]);
                  const diff = av != null && bv != null ? av - bv : null;

                  // Colores alto/bajo
                  const aClass = compareClass(av, bv, "A");
                  const bClass = compareClass(av, bv, "B");

                  return (
                    <div className="ccm-row" key={k}>
                      <div className="ccm-cell ccm-statname">
                        <div className="ccm-statlabel">{statLabelEs(k)}</div>
                        <div className="ccm-statkey">{k}</div>
                      </div>

                      <div className={`ccm-cell ccm-val ${aClass}`}>{formatVal(av)}</div>
                      <div className={`ccm-cell ccm-val ${bClass}`}>{formatVal(bv)}</div>

                      <div className={`ccm-cell ccm-diff ${diffClass(diff)}`}>
                        {formatDiff(diff)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ccm-legend">
                <span className="ccm-chip high">Más alto</span>
                <span className="ccm-chip low">Más bajo</span>
                <span className="ccm-chip eq">Igual</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroCard({ champ }) {
  return (
    <div className="ccm-hero">
      <img className="ccm-hero-icon" src={champ.iconUrl} alt={champ.name} />
      <div>
        <div className="ccm-hero-name">{champ.name}</div>
        <div className="ccm-hero-title">{champ.title}</div>
        <div className="ccm-tags">
          {(champ.tags || []).map((t) => (
            <span className="ccm-tag" key={t}>
              {t}
            </span>
          ))}
          {champ.partype && <span className="ccm-tag ccm-tag-subtle">{champ.partype}</span>}
        </div>
      </div>
    </div>
  );
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatVal(v) {
  if (v == null) return "—";
  return Number.isInteger(v)
    ? String(v)
    : v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatDiff(d) {
  if (d == null) return "—";
  const sign = d > 0 ? "+" : "";
  return `${sign}${formatVal(d)}`;
}

function diffClass(d) {
  if (d == null) return "";
  if (d > 0) return "is-up";     // left > right
  if (d < 0) return "is-down";   // left < right
  return "is-eq";
}

/**
 * Devuelve clases para pintar alto/ bajo en verde/rojo
 * side: "A" (left) o "B" (right)
 */
function compareClass(a, b, side) {
  if (a == null || b == null) return "";
  if (a === b) return "is-eq";
  if (side === "A") return a > b ? "is-high" : "is-low";
  return b > a ? "is-high" : "is-low";
}

/**
 * Traducción a ES + nombres representativos.
 * Si no está mapeado, lo humanizamos (camelCase -> palabras).
 */
function statLabelEs(key) {
  const map = {
    hp: "Vida",
    hpperlevel: "Vida por nivel",
    mp: "Maná/Energía",
    mpperlevel: "Recurso por nivel",
    armor: "Armadura",
    armorperlevel: "Armadura por nivel",
    spellblock: "Resistencia mágica",
    spellblockperlevel: "RM por nivel",
    attackdamage: "Daño de ataque",
    attackdamageperlevel: "DA por nivel",
    attackspeed: "Velocidad de ataque",
    attackspeedperlevel: "Vel. ataque por nivel",
    attackrange: "Alcance de ataque",
    movespeed: "Velocidad de movimiento",
    hpregen: "Regeneración de vida",
    hpregenperlevel: "Regen vida por nivel",
    mpregen: "Regeneración de recurso",
    mpregenperlevel: "Regen recurso por nivel",
    crit: "Prob. crítico",
    critperlevel: "Crítico por nivel",
  };

  if (map[key]) return map[key];

  // fallback: "spellblockperlevel" -> "Spellblockperlevel" -> "Spellblockperlevel" humanizado
  const pretty = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/perlevel/gi, " por nivel")
    .replace(/hp/gi, "Vida")
    .replace(/mp/gi, "Recurso")
    .trim();

  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}
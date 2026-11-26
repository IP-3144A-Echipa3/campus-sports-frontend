import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell, FacilityStatus, PageHeading } from "../components/AppShell";
import api from "../services/api";

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function formatTimeShort(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : "08:00";
}

function calculateSlotStats(teren, rezervari, selectedDate) {
  const startHour = parseInt((teren.OraDeschidere || "08:00:00").slice(0, 2), 10);
  const endHour = parseInt((teren.OraInchidere || "22:00:00").slice(0, 2), 10);
  const totalSlots = Math.max(0, endHour - startHour);

  const dayBookings = rezervari.filter(
    (r) =>
      r.TerenID === teren.TerenID &&
      r.Status !== "Anulata" &&
      r.OraStart.startsWith(selectedDate)
  );

  // Count how many 1-hour slots are covered by confirmed bookings on selectedDate
  let bookedHours = 0;
  dayBookings.forEach((b) => {
    const bStart = new Date(b.OraStart).getHours();
    const bEnd = new Date(b.OraFinal).getHours();
    bookedHours += Math.max(1, bEnd - bStart);
  });

  const availableSlots = Math.max(0, totalSlots - bookedHours);
  return { availableSlots, totalSlots };
}

export function FacilitiesPage({ currentUser, onSignOut }) {
  const navigate = useNavigate();
  const [terenuri, setTerenuri] = useState([]);
  const [rezervari, setRezervari] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("Toate");
  const [date, setDate] = useState(localToday);

  const isAdmin = currentUser?.TipUser === "Admin";

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const [terenuriRes, rezervariRes] = await Promise.all([
        api.get("/terenuri"),
        api.get("/rezervari"),
      ]);
      setTerenuri(terenuriRes.data);
      setRezervari(rezervariRes.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Nu am putut încărca lista terenurilor sportive."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteTeren(teren) {
    if (!window.confirm(`Sigur dorești să ștergi "${teren.Denumire}"?`)) return;
    try {
      await api.delete(`/terenuri/${teren.TerenID}`);
      setTerenuri((prev) => prev.filter((item) => item.TerenID !== teren.TerenID));
    } catch (err) {
      alert(err.response?.data?.error || "Eroare la ștergerea terenului.");
    }
  }

  const sports = useMemo(() => {
    const uniqueMap = new Map();
    terenuri.forEach((t) => {
      if (!t.Sport) return;
      const trimmed = t.Sport.trim();
      const key = trimmed.toLocaleLowerCase("ro");
      if (trimmed && !uniqueMap.has(key)) {
        uniqueMap.set(key, trimmed);
      }
    });
    return Array.from(uniqueMap.values());
  }, [terenuri]);

  const visibleTerenuri = useMemo(() => {
    return terenuri.filter((teren) => {
      const matchesName = teren.Denumire
        .toLocaleLowerCase("ro")
        .includes(search.toLocaleLowerCase("ro").trim());
      const matchesSport =
        sportFilter === "Toate" ||
        (teren.Sport || "").trim().toLocaleLowerCase("ro") ===
          sportFilter.trim().toLocaleLowerCase("ro");
      return matchesName && matchesSport;
    });
  }, [terenuri, search, sportFilter]);

  function handleOpenBooking(teren) {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate(`/rezerva/${teren.TerenID}?date=${date}`);
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={onSignOut}>
      {!currentUser && (
        <div className="cs-guest-banner">
          <span>
            Vizualizezi facilitățile ca <strong>vizitator</strong>. Autentifică-te pentru a rezerva un interval orar.
          </span>
          <Link to="/login" className="cs-inline-link" style={{ textDecoration: "none" }}>
            Autentificare →
          </Link>
        </div>
      )}

      <div className="cs-page-title-row">
        <div>
          <PageHeading>Facilități sportive</PageHeading>
          <p className="cs-page-subtitle">
            Disponibilitate · {formatDate(date)}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isAdmin && (
            <Link
              to="/adauga-teren"
              className="cs-button cs-button-small cs-button-primary"
              style={{ textDecoration: "none" }}
            >
              + Adaugă teren
            </Link>
          )}
          <span className="cs-live-indicator">
            <span className="cs-live-dot" />
            Live
          </span>
        </div>
      </div>

      <div className="cs-filters">
        <input
          aria-label="Caută facilitate"
          className="cs-filter-input cs-search"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după denumire teren..."
          value={search}
        />

        <input
          aria-label="Dată"
          className="cs-filter-input"
          min={localToday()}
          onChange={(e) => setDate(e.target.value || localToday())}
          type="date"
          value={date}
        />

        <select
          aria-label="Sport"
          className="cs-filter-input"
          onChange={(e) => setSportFilter(e.target.value)}
          value={sportFilter}
        >
          <option value="Toate">Sport: Toate</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="cs-message" role="status">
          Se încarcă facilitățile...
        </p>
      )}
      {error && (
        <p className="cs-message cs-error" role="alert">
          {error}
        </p>
      )}

      <div className="cs-facility-grid">
        {visibleTerenuri.map((teren) => {
          const { availableSlots, totalSlots } = calculateSlotStats(
            teren,
            rezervari,
            date
          );

          const computedStatus = !teren.Disponibil
            ? "maintenance"
            : availableSlots > 0
              ? "available"
              : "busy";

          return (
            <article className="cs-facility-card" key={teren.TerenID}>
              <div className="cs-facility-image" aria-hidden="true" />
              <h2 className="cs-facility-title">{teren.Denumire}</h2>
              <p className="cs-facility-meta">
                {teren.Sport} · Program {formatTimeShort(teren.OraDeschidere)}–
                {formatTimeShort(teren.OraInchidere)} ·{" "}
                <strong>{Number(teren.TarifOrar).toFixed(2)} RON/oră</strong>
              </p>

              <div className="cs-facility-status">
                <FacilityStatus status={computedStatus} />
              </div>

              <p className="cs-facility-availability">
                {!teren.Disponibil
                  ? "Teren indisponibil temporar"
                  : `${availableSlots} / ${totalSlots} intervale libere`}
              </p>

              <button
                className={`cs-button ${
                  computedStatus === "available"
                    ? "cs-button-primary"
                    : "cs-button-secondary"
                }`}
                disabled={!teren.Disponibil}
                onClick={() => handleOpenBooking(teren)}
                type="button"
              >
                {currentUser ? "Rezervă slot" : "Autentifică-te pentru rezervare"}
              </button>

              {isAdmin && (
                <div className="cs-card-actions">
                  <button
                    className="cs-button cs-button-small cs-button-secondary"
                    onClick={() => navigate(`/adauga-teren?edit=${teren.TerenID}`)}
                    type="button"
                  >
                    Editează
                  </button>
                  <button
                    className="cs-button cs-button-small cs-button-danger"
                    onClick={() => handleDeleteTeren(teren)}
                    type="button"
                  >
                    Șterge
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!isLoading && !error && visibleTerenuri.length === 0 && (
        <p className="cs-empty-state">
          Nu există facilități care să corespundă filtrelor selectate.
        </p>
      )}
    </AppShell>
  );
}
// JavaScript source code
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AppShell,
  FacilityStatus,
  PageHeading,
} from "../components/AppShell";
import api from "../services/api";

export function ReservationsPage({ currentUser, onSignOut }) {
  const navigate = useNavigate();
  const [rezervari, setRezervari] = useState([]);
  const [terenuriMap, setTerenuriMap] = useState({});
  const [utilizatoriMap, setUtilizatoriMap] = useState({});
  const [tab, setTab] = useState("Următoare");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser.TipUser === "Admin";

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true);
      setError("");
      try {
        const requests = [api.get("/rezervari"), api.get("/terenuri")];
        if (isAdmin) {
          requests.push(api.get("/utilizatori"));
        }

        const [rezRes, terRes, utilRes] = await Promise.all(requests);

        const tMap = {};
        terRes.data.forEach((t) => {
          tMap[t.TerenID] = t;
        });
        setTerenuriMap(tMap);

        if (utilRes) {
          const uMap = {};
          utilRes.data.forEach((u) => {
            uMap[u.UtilizatorID] = u;
          });
          setUtilizatoriMap(uMap);
        }

        // Students/Professors see only their own bookings; Admins see all
        const filtered = isAdmin
          ? rezRes.data
          : rezRes.data.filter(
              (r) => r.UtilizatorID === currentUser.UtilizatorID
            );
        setRezervari(filtered);
      } catch (err) {
        setError(
          err.response?.data?.error || "Nu am putut încărca rezervările."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();
  }, [currentUser, isAdmin]);

  async function handleCancelBooking(rezervare) {
    if (!window.confirm("Anulezi această rezervare?")) return;
    try {
      await api.put(`/rezervari/${rezervare.RezervareID}/status`, {
        Status: "Anulata",
      });
      setRezervari((prev) =>
        prev.map((item) =>
          item.RezervareID === rezervare.RezervareID
            ? { ...item, Status: "Anulata" }
            : item
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Nu am putut anula rezervarea.");
    }
  }

  async function handleDeleteBooking(rezervare) {
    if (!window.confirm("Ștergi definitiv această înregistrare?")) return;
    try {
      await api.delete(`/rezervari/${rezervare.RezervareID}`);
      setRezervari((prev) =>
        prev.filter((item) => item.RezervareID !== rezervare.RezervareID)
      );
    } catch (err) {
      alert(err.response?.data?.error || "Nu am putut șterge rezervarea.");
    }
  }

  const now = new Date();

  const visibleBookings = useMemo(() => {
    return rezervari.filter((r) => {
      const endDate = new Date(r.OraFinal);
      if (tab === "Anulate") return r.Status === "Anulata";
      if (tab === "Trecute") return r.Status !== "Anulata" && endDate < now;
      return r.Status !== "Anulata" && endDate >= now;
    });
  }, [rezervari, tab]);

  // Build real activity items from the latest 4 bookings
  const recentActivity = useMemo(() => {
    return [...rezervari]
      .sort((a, b) => new Date(b.DataCreare) - new Date(a.DataCreare))
      .slice(0, 4);
  }, [rezervari]);

  return (
    <AppShell currentUser={currentUser} onSignOut={onSignOut}>
      <PageHeading>
        {isAdmin ? "Administrare rezervări" : "Rezervările mele"}
      </PageHeading>

      <div className="cs-tabs" role="tablist" aria-label="Filtrează rezervările">
        {["Următoare", "Trecute", "Anulate"].map((item) => (
          <button
            aria-selected={tab === item}
            className={`cs-tab ${tab === item ? "is-active" : ""}`}
            key={item}
            onClick={() => setTab(item)}
            role="tab"
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="cs-message" role="status">
          Se încarcă rezervările...
        </p>
      )}
      {error && (
        <p className="cs-message cs-error" role="alert">
          {error}
        </p>
      )}

      <div className="cs-reservations-layout">
        <section className="cs-reservation-list" aria-label="Rezervări">
          {!isLoading && !error && visibleBookings.length === 0 && (
            <div className="cs-empty-card">
              Nu există rezervări în această categorie.
              <button
                className="cs-inline-link"
                onClick={() => navigate("/")}
                type="button"
              >
                Explorează facilitățile
              </button>
            </div>
          )}

          {visibleBookings.map((booking) => {
            const teren = terenuriMap[booking.TerenID];
            const user = utilizatoriMap[booking.UtilizatorID];
            const start = new Date(booking.OraStart);
            const end = new Date(booking.OraFinal);

            const dateStr = new Intl.DateTimeFormat("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "short",
            }).format(start);

            const timeStr = `${start.toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${end.toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <article className="cs-reservation-row" key={booking.RezervareID}>
                <div className="cs-facility-thumbnail" aria-hidden="true" />
                <div className="cs-reservation-copy">
                  <h2>
                    {teren ? teren.Denumire : `Teren #${booking.TerenID}`}
                    {teren ? ` (${teren.Sport})` : ""}
                  </h2>
                  <p>
                    {dateStr} · {timeStr}
                    {isAdmin && user ? ` · Rezervat de: ${user.Nume} (${user.Email})` : ""}
                  </p>
                </div>

                <div className="cs-reservation-actions">
                  <FacilityStatus status={booking.Status} />

                  {booking.Status === "Confirmata" && end >= now && (
                    <button
                      className="cs-button cs-button-small cs-button-secondary"
                      onClick={() => handleCancelBooking(booking)}
                      type="button"
                    >
                      Anulează
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="cs-button cs-button-small cs-button-danger"
                      onClick={() => handleDeleteBooking(booking)}
                      type="button"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cs-notifications-panel">
          <div className="cs-notifications-heading">
            <h2>Activitate recentă</h2>
            <span className="cs-new-count">{recentActivity.length}</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="cs-empty-state" style={{ paddingLeft: 0 }}>
              Nicio activitate recentă.
            </p>
          ) : (
            <ul className="cs-notification-list">
              {recentActivity.map((item) => {
                const teren = terenuriMap[item.TerenID];
                const isCancelled = item.Status === "Anulata";
                return (
                  <li className="cs-notification-item" key={item.RezervareID}>
                    <span
                      className={`cs-notification-dot ${
                        isCancelled ? "is-amber" : "is-green"
                      }`}
                    />
                    <div>
                      <p>
                        {isCancelled ? "Anulare" : "Confirmare"} —{" "}
                        {teren ? teren.Denumire : `Teren #${item.TerenID}`}
                      </p>
                      <time>
                        {new Date(item.OraStart).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        ·{" "}
                        {new Date(item.OraStart).toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
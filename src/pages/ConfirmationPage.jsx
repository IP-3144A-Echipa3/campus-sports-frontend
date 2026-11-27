// JavaScript source code
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppShell, BookingDetails } from "../components/AppShell";

export function ConfirmationPage({ currentUser, onSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();

  const rezervare = location.state?.rezervare;
  const teren = location.state?.teren;

  if (!rezervare) {
    return <Navigate to="/rezervari" replace />;
  }

  const startDate = new Date(rezervare.OraStart);
  const endDate = new Date(rezervare.OraFinal);
  const hours = Math.max(1, (endDate - startDate) / (1000 * 60 * 60));

  const formattedDate = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(startDate);

  const formattedInterval = `${startDate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${endDate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <AppShell currentUser={currentUser} onSignOut={onSignOut}>
      <div className="cs-confirmation-page">
        <section className="cs-confirmation-card">
          <div className="cs-confirmation-mark" aria-hidden="true">
            ✓
          </div>

          <h1 className="cs-confirmation-title">Rezervare confirmată</h1>
          <p className="cs-confirmation-copy">
            Intervalul orar a fost blocat în sistem pentru{" "}
            <strong>{currentUser?.Nume}</strong>.
          </p>

          <div className="cs-confirmation-details">
            <BookingDetails
              rows={[
                ["Cod rezervare", `#${rezervare.RezervareID}`],
                ["Teren", teren?.Denumire || `Teren #${rezervare.TerenID}`],
                ["Sport", teren?.Sport || "—"],
                ["Data", formattedDate],
                ["Interval", formattedInterval],
                [
                  "Tarif total",
                  teren
                    ? `${(Number(teren.TarifOrar) * hours).toFixed(2)} RON`
                    : "—",
                ],
                ["Status", rezervare.Status],
              ]}
            />
          </div>

          <button
            className="cs-button cs-button-primary cs-full-width"
            onClick={() => navigate("/rezervari")}
            type="button"
          >
            Vezi rezervările mele
          </button>

          <button
            className="cs-button cs-button-secondary cs-full-width cs-confirmation-secondary"
            onClick={() => navigate("/")}
            type="button"
          >
            Înapoi la facilități
          </button>
        </section>
      </div>
    </AppShell>
  );
}
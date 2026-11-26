import { useLocation, useNavigate } from "react-router-dom";

export function AppShell({
  currentUser,
  onSignOut,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const savedUser =
    currentUser || JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = savedUser?.TipUser === "Admin";
  const userLabel = savedUser
    ? `${savedUser.Nume} (${savedUser.TipUser})`
    : "Vizitator";

  const navigation = [
    { id: "facilities", label: "Facilități", path: "/" },
    { id: "bookings", label: "Rezervările mele", path: "/rezervari" },
    { id: "notifications", label: "Notificări", path: "/notificari" },
    ...(isAdmin ? [{ id: "admin", label: "Adaugă Teren", path: "/adauga-teren" }] : []),
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="cs-app">
      <header className="cs-topbar">
        <button
          className="cs-brand"
          type="button"
          onClick={() => navigate("/")}
          aria-label="Campus Sports — pagina principală"
        >
          <span className="cs-brand-mark">C</span>
          <span>Campus Sports</span>
        </button>

        <nav className="cs-nav" aria-label="Navigare principală">
          {navigation.map((item) => (
            <button
              className={`cs-nav-link ${isActive(item.path) ? "is-active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="cs-account">
          <span className="cs-avatar" aria-hidden="true" />
          <span>{userLabel}</span>
          {savedUser ? (
            <button className="cs-sign-out" type="button" onClick={onSignOut}>
              Ieșire
            </button>
          ) : (
            <button
              className="cs-sign-out"
              type="button"
              onClick={() => navigate("/login")}
            >
              Autentificare
            </button>
          )}
        </div>
      </header>

      <main className="cs-main">
        <div className="cs-content">{children}</div>
      </main>
    </div>
  );
}

export function PageHeading({ children }) {
  return <h1 className="cs-page-heading">{children}</h1>;
}

export function FacilityStatus({ status }) {
  const statusLabels = {
    available: "Disponibil acum",
    busy: "Ocupat",
    maintenance: "În mentenanță",
    confirmed: "Confirmat",
    waiting: "Listă așteptare",
  };

  const tone =
    status === "available" || status === "confirmed"
      ? "success"
      : status === "maintenance" || status === "waiting"
        ? "warning"
        : "danger";

  return (
    <span className={`cs-status cs-status-${tone}`}>
      <span className="cs-status-dot" aria-hidden="true" />
      {statusLabels[status] ?? status}
    </span>
  );
}

export function BookingDetails({ rows }) {
  return (
    <dl className="cs-details">
      {rows.map(([label, value]) => (
        <div className="cs-detail-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
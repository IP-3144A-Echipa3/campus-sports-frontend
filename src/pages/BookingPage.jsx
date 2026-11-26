import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AppShell,
  BookingDetails,
  FacilityStatus,
  PageHeading,
} from "../components/AppShell";
import api from "../services/api";

function toLocalDateStr(dateInput) {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function localToday() {
  return toLocalDateStr(new Date());
}

function addDays(dateStr, days) {
  const next = new Date(`${dateStr}T12:00:00`);
  next.setDate(next.getDate() + days);
  return toLocalDateStr(next);
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateStr}T12:00:00`));
}

function endTime(timeStr) {
  return `${String(Number(timeStr.slice(0, 2)) + 1).padStart(2, "0")}:00`;
}

export function BookingPage({ currentUser, onSignOut }) {
  const { id, terenId } = useParams();
  const activeId = id || terenId;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDate = searchParams.get("date") || localToday();
  const [date, setDate] = useState(initialDate);
  const [teren, setTeren] = useState(null);
  const [rezervari, setRezervari] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadFacilityAndBookings() {
    if (!activeId) {
      setError("Terenul solicitat nu a fost găsit.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const [terenRes, rezRes] = await Promise.all([
        api.get(`/terenuri/${activeId}`),
        api.get("/rezervari"),
      ]);
      setTeren(terenRes.data);
      setRezervari(rezRes.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Terenul solicitat nu a fost găsit."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFacilityAndBookings();
  }, [activeId]);

  const slots = useMemo(() => {
    if (!teren) return [];
    const startHour = parseInt((teren.OraDeschidere || "08:00:00").slice(0, 2), 10);
    const endHour = parseInt((teren.OraInchidere || "22:00:00").slice(0, 2), 10);

    const now = new Date();
    const isToday = date === toLocalDateStr(now);
    const currentHour = now.getHours();

    const dayBookings = rezervari.filter(
      (r) =>
        Number(r.TerenID) === Number(teren.TerenID) &&
        r.Status !== "Anulata" &&
        toLocalDateStr(r.OraStart) === date
    );

    const list = [];
    for (let h = startHour; h < endHour; h++) {
      const timeLabel = `${String(h).padStart(2, "0")}:00`;

      // Past hours today are unavailable (grey Ocupat)
      if (isToday && h <= currentHour) {
        list.push({ time: timeLabel, status: "busy", isPast: true });
        continue;
      }

      const overlapping = dayBookings.filter((b) => {
        const bStart = new Date(b.OraStart).getHours();
        const bEnd = new Date(b.OraFinal).getHours();
        return h >= bStart && h < Math.max(bStart + 1, bEnd);
      });

      const hasConfirmed = overlapping.some((b) => b.Status === "Confirmata");
      const waitlistCount = overlapping.filter(
        (b) => b.Status === "In Asteptare"
      ).length;

      // Once a slot has a confirmed booking, turn it yellow (Listă așteptare)
      // Cap waitlist at e.g. 3 people; beyond that, mark it fully grey (Ocupat)
      let status = "available";
      if (hasConfirmed) {
        status = waitlistCount >= 3 ? "busy" : "waiting";
      }

      list.push({ time: timeLabel, status, isPast: false });
    }
    return list;
  }, [teren, rezervari, date]);

  useEffect(() => {
    const firstAvailable = slots.find((s) => s.status !== "past");
    setSelectedTime(firstAvailable ? firstAvailable.time : "");
  }, [slots]);

  const selectedSlot = slots.find((s) => s.time === selectedTime);
  const isSlotOccupied =
    selectedSlot?.status === "busy" || selectedSlot?.status === "waiting";

  async function handleSubmitBooking(requestedStatus) {
    if (!teren || !selectedTime || !currentUser || selectedSlot?.status === "past") {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Send proper ISO strings in local timezone so backend & DB match 1:1
      const OraStart = new Date(`${date}T${selectedTime}:00`).toISOString();
      const OraFinal = new Date(`${date}T${endTime(selectedTime)}:00`).toISOString();

      const res = await api.post("/rezervari", {
        UtilizatorID: Number(currentUser.UtilizatorID || currentUser.id),
        TerenID: Number(teren.TerenID),
        OraStart,
        OraFinal,
        Status: requestedStatus,
      });

      navigate("/confirmare", {
        state: {
          booking: {
            id: String(res.data.RezervareID),
            facilityId: String(teren.TerenID),
            facilityName: teren.Denumire,
            location: `${teren.Sport} · ${Number(teren.TarifOrar).toFixed(2)} RON/oră`,
            date,
            time: selectedTime,
            status: requestedStatus === "In Asteptare" ? "waiting" : "confirmed",
          },
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Nu am putut salva rezervarea."
      );
      await loadFacilityAndBookings();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell currentUser={currentUser} onSignOut={onSignOut}>
        <p className="cs-message">Se încarcă detaliile terenului...</p>
      </AppShell>
    );
  }

  if (!teren) {
    return (
      <AppShell currentUser={currentUser} onSignOut={onSignOut}>
        <button className="cs-back-link" onClick={() => navigate("/")} type="button">
          ‹ &nbsp;Înapoi la facilități
        </button>
        <p className="cs-message cs-error">{error || "Terenul solicitat nu a fost găsit."}</p>
      </AppShell>
    );
  }

  const facilityStatus = !teren.Disponibil
    ? "maintenance"
    : slots.some((s) => s.status === "available")
      ? "available"
      : "busy";

  return (
    <AppShell currentUser={currentUser} onSignOut={onSignOut}>
      <button className="cs-back-link" onClick={() => navigate("/")} type="button">
        ‹ &nbsp;Înapoi la facilități
      </button>

      <div className="cs-booking-facility">
        <div className="cs-facility-thumbnail" aria-hidden="true" />
        <div className="cs-booking-facility-copy">
          <PageHeading>{teren.Denumire}</PageHeading>
          <p className="cs-page-subtitle">
            {teren.Sport} · {Number(teren.TarifOrar).toFixed(2)} RON / oră
          </p>
        </div>
        <FacilityStatus status={facilityStatus} />
      </div>

      <div className="cs-booking-layout">
        <section className="cs-slot-section">
          <div className="cs-date-picker" aria-label="Alege data">
            {Array.from({ length: 7 }, (_, index) => addDays(localToday(), index)).map(
              (day) => (
                <button
                  aria-pressed={date === day}
                  className={`cs-date-option ${date === day ? "is-selected" : ""}`}
                  key={day}
                  onClick={() => setDate(day)}
                  type="button"
                >
                  <span>
                    {new Intl.DateTimeFormat("ro-RO", { weekday: "short" }).format(
                      new Date(`${day}T12:00:00`)
                    )}
                  </span>
                  <strong>{Number(day.slice(-2))}</strong>
                </button>
              )
            )}
          </div>

          <div className="cs-slot-legend">
            <span><i className="cs-legend-box" />Disponibil</span>
            <span><i className="cs-legend-box is-busy" />Ocupat</span>
            <span><i className="cs-legend-box is-waiting" />Listă așteptare</span>
            <span><i className="cs-legend-box is-selected" />Selectat</span>
          </div>

          <h2 className="cs-section-heading">
            Sloturi — {formatDate(date)}
          </h2>

          <div className="cs-slot-grid">
            {slots.map((slot) => {
              const selected = slot.time === selectedTime;
              const isDisabled = slot.status === "busy";

              return (
                <button
                  aria-pressed={selected}
                  className={`cs-slot ${
                    selected
                      ? "is-selected"
                      : slot.status === "waiting"
                        ? "is-waiting"
                        : slot.status === "busy"
                          ? "is-busy"
                          : ""
                  }`}
                  disabled={isDisabled}
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  type="button"
                >
                  <strong>{slot.time}</strong>
                  <span>
                    {selected
                      ? "Selectat"
                      : slot.status === "waiting"
                        ? "Listă așteptare"
                        : slot.status === "busy"
                          ? "Ocupat"
                          : "Liber"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="cs-booking-summary">
          <h2 className="cs-summary-heading">Rezumat rezervare</h2>
          <BookingDetails
            rows={[
              ["Facilitate", teren.Denumire],
              ["Sport", teren.Sport],
              ["Data", formatDate(date)],
              ["Interval", selectedTime ? `${selectedTime} – ${endTime(selectedTime)}` : "—"],
              [
                "Status slot",
                !selectedSlot
                  ? "—"
                  : isSlotOccupied
                    ? "Ocupat (poți intra pe listă)"
                    : "Disponibil",
              ],
              ["Tarif", `${Number(teren.TarifOrar).toFixed(2)} RON`],
            ]}
          />

          <p className="cs-booking-rule">
            Dacă intervalul este ocupat, poți intra pe lista de așteptare și vei fi confirmat automat dacă rezervarea existentă se anulează.
          </p>

          {error && (
            <p className="cs-error cs-action-error" role="alert">
              {error}
            </p>
          )}

          {!isSlotOccupied ? (
            <button
              className="cs-button cs-button-primary cs-full-width"
              disabled={
                isSubmitting ||
                !selectedTime ||
                !teren.Disponibil ||
                selectedSlot?.status === "past"
              }
              onClick={() => handleSubmitBooking("Confirmata")}
              type="button"
            >
              {isSubmitting ? "Se rezervă..." : "Confirmă rezervarea"}
            </button>
          ) : (
            <button
              className="cs-button cs-button-secondary cs-full-width"
              disabled={isSubmitting || !selectedTime || !teren.Disponibil}
              onClick={() => handleSubmitBooking("In Asteptare")}
              type="button"
            >
              {isSubmitting ? "Se adaugă..." : "Intră pe lista de așteptare"}
            </button>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
// Convert a backend Teren + today's bookings into Builder's Facility interface
export function mapTerenToFacility(teren, allBookings = []) {
  const startHour = Number((teren.OraDeschidere || "08:00:00").slice(0, 2));
  const endHour = Number((teren.OraInchidere || "22:00:00").slice(0, 2));
  const totalSlots = Math.max(1, endHour - startHour);

  const today = new Date().toISOString().slice(0, 10);
  const bookedTodayCount = allBookings.filter(
    (b) =>
      Number(b.TerenID) === Number(teren.TerenID) &&
      b.Status !== "Anulata" &&
      String(b.OraStart).startsWith(today)
  ).length;

  const availableSlots = teren.Disponibil
    ? Math.max(0, totalSlots - bookedTodayCount)
    : 0;

  let status = "available";
  if (!teren.Disponibil) status = "maintenance";
  else if (availableSlots === 0) status = "busy";

  return {
    id: String(teren.TerenID),
    name: teren.Denumire,
    category: teren.Sport,
    location: `${teren.TarifOrar} RON / oră`,
    capacity: 12,
    status,
    available: availableSlots,
    total: totalSlots,
    raw: teren,
  };
}

// Generate hourly slots from OraDeschidere..OraInchidere and mark busy ones from Rezervari
export function buildSlotsForDate(facility, date, allBookings = []) {
  const startHour = Number((facility.raw?.OraDeschidere || "08:00:00").slice(0, 2));
  const endHour = Number((facility.raw?.OraInchidere || "22:00:00").slice(0, 2));

  const dayBookings = allBookings.filter(
    (b) =>
      Number(b.TerenID) === Number(facility.id) &&
      b.Status !== "Anulata" &&
      String(b.OraStart).slice(0, 10) === date
  );

  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    const timeLabel = `${String(h).padStart(2, "0")}:00`;
    const isBooked = dayBookings.some((b) => {
      const bookedHour = new Date(b.OraStart).getHours();
      return bookedHour === h;
    });

    slots.push({
      time: timeLabel,
      status: isBooked ? "busy" : "available",
    });
  }
  return slots;
}

// Convert a backend Rezervare into Builder's Booking interface
export function mapRezervareToBooking(rez, terenuriMap = {}) {
  const teren = terenuriMap[Number(rez.TerenID)];
  const start = new Date(rez.OraStart);

  const date = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(start.getDate()).padStart(2, "0")}`;

  const time = `${String(start.getHours()).padStart(2, "0")}:${String(
    start.getMinutes()
  ).padStart(2, "0")}`;

  return {
    id: String(rez.RezervareID),
    facilityId: String(rez.TerenID),
    facilityName: teren ? teren.Denumire : `Teren #${rez.TerenID}`,
    location: teren ? `${teren.Sport} · ${teren.TarifOrar} RON/h` : "Campus Sportiv",
    date,
    time,
    status: rez.Status === "In Asteptare" ? "waiting" : "confirmed",
    rawStatus: rez.Status,
    utilizatorId: rez.UtilizatorID,
  };
}
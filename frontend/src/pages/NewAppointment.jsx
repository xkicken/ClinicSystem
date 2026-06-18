import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/axiosAPI";

export default function NewAppointment() {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patient");
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");
    const [slots, setSlots] = useState([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page_count: 0, has_next: false, has_previous: false });
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get("/doctors/")
            .then(res => setDoctors(res.data))
            .catch(() => setError("Failed to load doctors."));
    }, []);

    useEffect(() => {
        setSelectedSlot(null);
        setPage(0);
    }, [doctorId]);

    useEffect(() => {
        if (!doctorId) {
            setSlots([]);
            setPageInfo({ page_count: 0, has_next: false, has_previous: false });
            return;
        }
        api.get(`/timeslots/?doctor=${doctorId}&page=${page}`)
            .then(res => {
                setSlots(res.data.results);
                setPageInfo({
                    page_count: res.data.page_count,
                    has_next: res.data.has_next,
                    has_previous: res.data.has_previous,
                });
            })
            .catch(() => setError("Failed to load time slots."));
    }, [doctorId, page]);

    const slotsByDate = useMemo(() => {
        const map = {};
        const sorted = [...slots].sort((a, b) =>
            (a.date + a.start_time).localeCompare(b.date + b.start_time));
        for (const s of sorted) (map[s.date] ||= []).push(s);
        return map;
    }, [slots]);

    const dates = Object.keys(slotsByDate);
    const todayKey = useMemo(() => toKey(new Date()), []);

    async function handleBook() {
        if (!selectedSlot) return;
        setError("");
        setSubmitting(true);
        try {
            const res = await api.post("/appointments/", {
                patient_id: Number(patientId),
                time_slot_id: selectedSlot.id,
            });
            navigate("/booking/confirm", { state: { appointment: res.data } });
        } catch (err) {
            setError(err.response?.data?.detail || "Could not book the appointment.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!patientId) return <p className="text-center mt-4">No patient selected.</p>;

    return (
        <div className="container py-4">
            <h3 className="text-center mb-3">Book Appointment</h3>

            <div className="mb-3 mx-auto" style={{ maxWidth: 400 }}>
                <label className="form-label">Doctor</label>
                <select className="form-select" value={doctorId}
                        onChange={e => setDoctorId(e.target.value)} required>
                    <option value="">Select a doctor</option>
                    {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                            Dr. {d.account.first_name} {d.account.last_name} — {d.specialty.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="d-flex justify-content-center gap-4 mb-3 small flex-wrap">
                <span className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">&nbsp;&nbsp;</span> Available
                </span>
                <span className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger">&nbsp;&nbsp;</span> Booked
                </span>
                <span className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary">&nbsp;&nbsp;</span> Unavailable
                </span>
            </div>

            {error && (
                <div className="alert alert-danger mx-auto" style={{ maxWidth: 600 }}>{error}</div>
            )}

            {doctorId && dates.length === 0 && (
                <p className="text-center text-muted">No slots for this doctor.</p>
            )}

            {dates.length > 0 && (
                <>
                    <div style={{ height: 420, overflowY: "auto", overflowX: "auto" }}>
                        <div className="d-flex gap-3 justify-content-center flex-nowrap">
                            {dates.map(date => {
                                const isToday = date === todayKey;
                                return (
                                    <div key={date}
                                         className={`card shadow-sm ${isToday ? "border-primary border-2" : ""}`}
                                         style={{ minWidth: 170 }}>
                                        <div className={`card-header text-center fw-semibold ${isToday ? "text-bg-primary" : ""}`}
                                             style={{
                                                 position: "sticky", top: 0, zIndex: 2,
                                                 backgroundColor: isToday ? undefined : "var(--bs-card-bg)",
                                             }}>
                                            {formatDate(date)}{isToday ? " • Today" : ""}
                                        </div>
                                        <div className="card-body d-flex flex-column gap-2">
                                            {slotsByDate[date].map(slot => {
                                                if (slot.booked) {
                                                    return (
                                                        <button key={slot.id} type="button"
                                                                className="btn btn-sm btn-danger" disabled>
                                                            {formatTime(slot.start_time)}
                                                        </button>
                                                    );
                                                }
                                                if (!slot.is_available) {
                                                    return (
                                                        <button key={slot.id} type="button"
                                                                className="btn btn-sm btn-secondary" disabled>
                                                            {formatTime(slot.start_time)}
                                                        </button>
                                                    );
                                                }
                                                const active = selectedSlot?.id === slot.id;
                                                return (
                                                    <button key={slot.id} type="button"
                                                            className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-primary"}`}
                                                            onClick={() => setSelectedSlot(slot)}>
                                                        {formatTime(slot.start_time)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                        <button className="btn btn-outline-secondary btn-sm"
                                onClick={() => setPage(p => p - 1)} disabled={!pageInfo.has_previous}>
                            ‹ Previous
                        </button>
                        <button className="btn btn-outline-primary btn-sm"
                                onClick={() => setPage(0)} disabled={page === 0}>
                            Today
                        </button>
                        <button className="btn btn-outline-secondary btn-sm"
                                onClick={() => setPage(p => p + 1)} disabled={!pageInfo.has_next}>
                            Next ›
                        </button>
                    </div>
                </>
            )}

            {selectedSlot && (
                <div className="text-center mt-4">
                    <p className="mb-2">
                        Selected:{" "}
                        <strong>{formatDate(selectedSlot.date)} at {formatTime(selectedSlot.start_time)}</strong>
                    </p>
                    <button className="btn btn-success px-4" onClick={handleBook} disabled={submitting}>
                        {submitting ? "Booking…" : "Confirm booking"}
                    </button>
                </div>
            )}
        </div>
    );
}

function toKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric",
    });
}
function formatTime(timeStr) {
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString(undefined, {
        hour: "numeric", minute: "2-digit",
    });
}
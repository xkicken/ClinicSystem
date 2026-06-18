import { useEffect, useMemo, useState } from "react";
import api from "../services/axiosAPI";

export default function AdminTimeSlots() {
    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");
    const [slots, setSlots] = useState([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page_count: 0, has_next: false, has_previous: false });

    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [form, setForm] = useState({ date: "", start_time: "", end_time: "" });
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        api.get("/doctors/")
            .then(res => setDoctors(res.data))
            .catch(() => setError("Failed to load doctors."));
    }, []);

    useEffect(() => { setPage(0); setSelectedId(null); }, [doctorId]);

    function loadSlots() {
        if (!doctorId) { setSlots([]); return; }
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
    }
    useEffect(loadSlots, [doctorId, page]);

    // fetch full detail (incl. patient) when a slot is selected
    useEffect(() => {
        if (!selectedId) { setDetail(null); return; }
        setDetailLoading(true);
        api.get(`/timeslots/${selectedId}/`)
            .then(res => setDetail(res.data))
            .catch(() => setError("Could not load slot details."))
            .finally(() => setDetailLoading(false));
    }, [selectedId]);

    const slotsByDate = useMemo(() => {
        const map = {};
        const sorted = [...slots].sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
        for (const s of sorted) (map[s.date] ||= []).push(s);
        return map;
    }, [slots]);
    const dates = Object.keys(slotsByDate);

    function refresh() { loadSlots(); if (selectedId) api.get(`/timeslots/${selectedId}/`).then(res => setDetail(res.data)); }

    async function createSlot(e) {
        e.preventDefault(); setError(""); setMsg("");
        try {
            await api.post("/timeslots/", { doctor: Number(doctorId), ...form, booked: false });
            setForm({ date: "", start_time: "", end_time: "" });
            loadSlots();
        } catch (err) { setError(err.response?.data?.detail || "Could not create slot."); }
    }

    async function toggleAvailable() {
        try {
            await api.patch(`/timeslots/${detail.id}/`, { is_available: !detail.is_available });
            refresh();
        } catch (err) { setError(err.response?.data?.detail || "Could not update slot."); }
    }

    async function cancelAppointment() {
        if (!detail?.appointment) return;
        if (!window.confirm("Cancel this appointment? The slot will be freed.")) return;
        try {
            await api.patch(`/appointments/${detail.appointment.id}/`, { appointment_status: "CANCELLED" });
            refresh();
        } catch (err) { setError(err.response?.data?.detail || "Could not cancel appointment."); }
    }

    async function generate() {
        setError(""); setMsg("");
        try {
            const res = await api.post("/timeslots/generate/");
            setMsg(res.data.detail || "Slots generated.");
            loadSlots();
        } catch { setError("Could not generate slots."); }
    }

    return (
        <div className="container py-4" style={{maxWidth: "900px"}}>
            <h3 className="fw-bold text-center mb-4">Time Slot Management</h3>

            <div className="d-flex justify-content-between align-items-end gap-3 mb-3 flex-wrap">
                <div style={{ minWidth: 280 }}>
                    <label className="form-label">Doctor</label>
                    <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                        <option value="">Select a doctor</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                                Dr. {d.account.first_name} {d.account.last_name} — {d.specialty?.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-outline-success" onClick={generate}>
                    Generate this week’s slots
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            {doctorId && (
                <form className="card shadow-sm p-3 mb-3" onSubmit={createSlot}>
                    <h6 className="mb-2">Add a slot</h6>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label small">Date</label>
                            <input type="date" className="form-control form-control-sm"
                                   value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required/>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Start</label>
                            <input type="time" className="form-control form-control-sm"
                                   value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required/>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">End</label>
                            <input type="time" className="form-control form-control-sm"
                                   value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required/>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-sm btn-primary w-100">Add</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="d-flex justify-content-center gap-4 mb-2 small flex-wrap">
                <span className="d-flex align-items-center gap-2"><span className="badge bg-primary">&nbsp;&nbsp;</span> Available</span>
                <span className="d-flex align-items-center gap-2"><span className="badge bg-danger">&nbsp;&nbsp;</span> Booked</span>
                <span className="d-flex align-items-center gap-2"><span className="badge bg-secondary">&nbsp;&nbsp;</span> Unavailable</span>
            </div>
            {doctorId && dates.length > 0 && (
                <p className="text-center text-muted small mb-3">Click a slot to view details, patient info, and actions.</p>
            )}

            {doctorId && dates.length === 0 && <p className="text-center text-muted">No slots for this doctor.</p>}

            {dates.length > 0 && (
                <>
                    <div style={{ height: 420, overflowY: "auto", overflowX: "auto" }}>
                        <div className="d-flex gap-3 justify-content-center flex-nowrap">
                            {dates.map(date => (
                                <div key={date} className="card shadow-sm" style={{ minWidth: 160 }}>
                                    <div className="card-header text-center fw-semibold"
                                         style={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "var(--bs-card-bg)" }}>
                                        {formatDate(date)}
                                    </div>
                                    <div className="card-body d-flex flex-column gap-2">
                                        {slotsByDate[date].map(slot => {
                                            const selected = selectedId === slot.id;
                                            const cls = slot.booked ? "btn-danger"
                                                : !slot.is_available ? "btn-secondary"
                                                    : selected ? "btn-primary" : "btn-outline-primary";
                                            return (
                                                <button key={slot.id} type="button"
                                                        className={`btn btn-sm ${cls}`}
                                                        onClick={() => setSelectedId(slot.id)}>
                                                    {formatTime(slot.start_time)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                        <button className="btn btn-outline-secondary btn-sm"
                                onClick={() => setPage(p => p - 1)} disabled={!pageInfo.has_previous}>‹ Previous</button>
                        <span className="text-muted small">Page {page + 1} of {pageInfo.page_count}</span>
                        <button className="btn btn-outline-secondary btn-sm"
                                onClick={() => setPage(p => p + 1)} disabled={!pageInfo.has_next}>Next ›</button>
                    </div>
                </>
            )}

            {selectedId && (
                <div className="card shadow-sm p-3 mt-4 mx-auto" style={{ maxWidth: 480 }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Slot Details</h6>
                        <button className="btn-close" onClick={() => setSelectedId(null)} aria-label="Close"/>
                    </div>

                    {detailLoading || !detail ? (
                        <p className="text-muted mb-0">Loading…</p>
                    ) : (
                        <>
                            <dl className="row mb-3">
                                <dt className="col-4">Doctor</dt>
                                <dd className="col-8">Dr. {detail.doctor_name}</dd>
                                <dt className="col-4">Date</dt>
                                <dd className="col-8">{formatDate(detail.date)}</dd>
                                <dt className="col-4">Time</dt>
                                <dd className="col-8">{formatTime(detail.start_time)} – {formatTime(detail.end_time)}</dd>
                                <dt className="col-4">Status</dt>
                                <dd className="col-8">
                                    {detail.booked
                                        ? <span className="badge bg-danger">Booked</span>
                                        : detail.is_available
                                            ? <span className="badge bg-primary">Available</span>
                                            : <span className="badge bg-secondary">Unavailable</span>}
                                </dd>
                            </dl>

                            {detail.appointment ? (
                                <div className="border rounded p-3">
                                    <h6 className="mb-2">Patient</h6>
                                    <dl className="row mb-3 small">
                                        <dt className="col-4">Name</dt>
                                        <dd className="col-8">
                                            {detail.appointment.patient.first_name} {detail.appointment.patient.last_name}
                                        </dd>
                                        <dt className="col-4">Phone</dt>
                                        <dd className="col-8">{detail.appointment.patient.phone}</dd>
                                        <dt className="col-4">DOB</dt>
                                        <dd className="col-8">{detail.appointment.patient.date_of_birth}</dd>
                                        <dt className="col-4">Status</dt>
                                        <dd className="col-8">{detail.appointment.appointment_status}</dd>
                                    </dl>
                                    {detail.appointment.appointment_status === "BOOKED" && (
                                        <button className="btn btn-danger" onClick={cancelAppointment}>
                                            Cancel appointment
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button className={`btn ${detail.is_available ? "btn-outline-warning" : "btn-outline-success"}`}
                                        onClick={toggleAvailable}>
                                    {detail.is_available ? "Make unavailable" : "Make available"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function formatDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(t) {
    return new Date(`1970-01-01T${t}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
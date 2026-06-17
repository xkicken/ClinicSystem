import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/axiosAPI";

export default function AppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appt, setAppt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        api.get(`/appointments/${id}/`)
            .then(res => setAppt(res.data))
            .catch(() => setError("Could not load this appointment."))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleCancel() {
        if (!window.confirm("Cancel this appointment?")) return;
        setCancelling(true);
        setError("");
        try {
            const res = await api.patch(`/appointments/${id}/`, {
                appointment_status: "CANCELLED",
            });
            setAppt(res.data);
        } catch {
            setError("Could not cancel the appointment.");
        } finally {
            setCancelling(false);
        }
    }

    if (loading) return <p className="text-center mt-4">Loading…</p>;
    if (error && !appt) return <p className="text-center mt-4 text-danger">{error}</p>;
    if (!appt) return null;

    const { patient, time_slot, appointment_status } = appt;

    return (
        <div className="d-flex justify-content-center mt-4">
            <div className="card shadow-sm p-4" style={{ width: 480 }}>
                <h3 className="mb-3">Appointment Details</h3>

                <dl className="row mb-0">
                    <dt className="col-5">Patient</dt>
                    <dd className="col-7">{patient.first_name} {patient.last_name}</dd>

                    <dt className="col-5">Doctor</dt>
                    <dd className="col-7">Dr. {time_slot.doctor_name}</dd>

                    <dt className="col-5">Date</dt>
                    <dd className="col-7">{formatDate(time_slot.date)}</dd>

                    <dt className="col-5">Time</dt>
                    <dd className="col-7">
                        {formatTime(time_slot.start_time)} – {formatTime(time_slot.end_time)}
                    </dd>

                    <dt className="col-5">Status</dt>
                    <dd className="col-7">
                        <span className={`badge ${statusClass(appointment_status)}`}>
                            {appointment_status}
                        </span>
                    </dd>
                </dl>

                {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

                <div className="mt-4 d-flex gap-2 align-items-center">
                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        ‹ Back
                    </button>
                    {appointment_status === "BOOKED" && (
                        <button className="btn btn-danger ms-auto"
                                onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? "Cancelling…" : "Cancel appointment"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function statusClass(s) {
    if (s === "BOOKED") return "bg-success";
    if (s === "CANCELLED") return "bg-danger";
    return "bg-secondary"; // DONE / other
}

function formatDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
}

function formatTime(t) {
    return new Date(`1970-01-01T${t}`).toLocaleTimeString(undefined, {
        hour: "numeric", minute: "2-digit",
    });
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosAPI";

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/dashboard/doctor/")
            .then(res => setAppointments(res.data))
            .catch(() => setError("Could not load your dashboard."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-center mt-4">Loading…</p>;
    if (error) return <p className="text-center mt-4 text-danger">{error}</p>;

    const today = new Date().toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric",
    });

    return (
        <div className="container py-4">
            <h3 className="fw-bold text-center">Doctor Dashboard</h3>
            <p className="text-muted text-center mb-4">Today’s appointments · {today}</p>

            <div className="mx-auto" style={{ maxWidth: 700 }}>
                {appointments.length === 0 ? (
                    <p className="text-center text-muted">No appointments scheduled for today.</p>
                ) : (
                    appointments.map(apt => (
                        <Link key={apt.id} to={`/appointment/${apt.id}`}
                              className="card shadow-sm mb-3 text-decoration-none text-reset">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-semibold fs-5">
                                        {apt.patient.first_name} {apt.patient.last_name}
                                    </div>
                                    <div className="text-muted small">
                                        {formatTime(apt.time_slot.start_time)} – {formatTime(apt.time_slot.end_time)}
                                    </div>
                                </div>
                                <span className="badge bg-success align-self-center">
                                    {apt.appointment_status}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function formatTime(t) {
    return new Date(`1970-01-01T${t}`).toLocaleTimeString(undefined, {
        hour: "numeric", minute: "2-digit",
    });
}
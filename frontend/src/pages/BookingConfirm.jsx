import { useLocation, Link, Navigate } from "react-router-dom";

export default function BookingConfirm() {
    const { state } = useLocation();
    const appointment = state?.appointment;

    if (!appointment) return <Navigate to="/dashboard/user" replace />;

    const { id, patient, time_slot } = appointment;

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="card shadow-sm p-4 text-center" style={{ width: 460 }}>
                <div className="text-success mb-2" style={{ fontSize: "3rem", lineHeight: 1 }}>✓</div>
                <h3 className="mb-3">Appointment Confirmed</h3>

                <dl className="row text-start mb-4">
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
                </dl>

                <div className="d-flex gap-2 justify-content-center">
                    <Link to={`/appointment/${id}`} className="btn btn-outline-primary">
                        View appointment
                    </Link>
                    <Link to="/dashboard/user" className="btn btn-primary">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
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
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="container py-5">
            {/* hero */}
            <div className="text-center mb-5">
                <h1 className="fw-bold mb-3">Welcome to Clinic System</h1>
                <p className="text-muted fs-5 mb-4">
                    Book appointments, manage your patients, and keep track of your schedule — all in one place.
                </p>

                {user ? (
                    <div className="d-flex justify-content-center gap-3">
                        <Link to={dashboardPath(user.group)} className="btn btn-primary btn-lg">
                            Go to Dashboard
                        </Link>
                        <Link to="/calendar" className="btn btn-outline-primary btn-lg">
                            View Calendar
                        </Link>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                        <Link to="/register" className="btn btn-outline-primary btn-lg">Register</Link>
                    </div>
                )}
            </div>

            {/* feature cards */}
            <div className="row g-4 justify-content-center">
                {FEATURES.map(f => (
                    <div key={f.title} className="col-md-4">
                        <div className="card shadow-sm h-100 text-center">
                            <div className="card-body">
                                <div className="fs-1 mb-2">{f.icon}</div>
                                <h5 className="card-title">{f.title}</h5>
                                <p className="card-text text-muted small">{f.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const FEATURES = [
    { icon: "📅", title: "Book Appointments", text: "Pick a doctor and an available time slot in a few clicks." },
    { icon: "👥", title: "Manage Patients", text: "Add and update the people you book appointments for." },
    { icon: "🗓️", title: "Your Calendar", text: "See upcoming and past appointments at a glance." },
];

function dashboardPath(group) {
    if (group === "Doctor") return "/doctor-dashboard";
    if (group === "Admin")  return "/admin-dashboard";
    return "/user-dashboard";
}
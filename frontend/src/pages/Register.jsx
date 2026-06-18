import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/axiosAPI";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "", first_name: "", last_name: "", email: "", password: "", confirm: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/auth/register", {
                username: form.username,
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
            });
            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(formatError(err.response?.data?.detail) || "Could not register. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="card shadow-sm p-4" style={{ width: 420 }}>
                <h3 className="text-center mb-3">Register</h3>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Username</label>
                            <input className="form-control" name="username"
                                   value={form.username} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">First name</label>
                            <input className="form-control" name="first_name"
                                   value={form.first_name} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Last name</label>
                            <input className="form-control" name="last_name"
                                   value={form.last_name} onChange={handleChange} required/>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" name="email"
                                   value={form.email} onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" name="password"
                                   value={form.password} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Confirm password</label>
                            <input type="password" className="form-control" name="confirm"
                                   value={form.confirm} onChange={handleChange} required/>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <button className="btn btn-primary w-100 mt-3" disabled={submitting}>
                        {submitting ? "Creating account…" : "Register"}
                    </button>

                    <div className="text-center mt-3">
                        <small className="text-muted">
                            Already have an account? <Link to="/login">Login here</Link>
                        </small>
                    </div>
                </form>
            </div>
        </div>
    );
}

function formatError(detail) {
    if (!detail) return null;
    if (typeof detail === "string") return detail;
    return Object.entries(detail)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
        .join("  ");
}
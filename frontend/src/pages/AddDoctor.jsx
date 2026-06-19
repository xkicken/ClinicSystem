import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosAPI";

export default function AddDoctor() {
    const navigate = useNavigate();
    const [specialties, setSpecialties] = useState([]);
    const [form, setForm] = useState({
        username: "", first_name: "", last_name: "", email: "", password: "",
        specialty_id: "", phone: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get("/specialties/")
            .then(res => setSpecialties(res.data))
            .catch(() => setError("Failed to load specialties."));
    }, []);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/doctors/add/", { ...form, specialty_id: Number(form.specialty_id) });
            navigate("/admin/doctor");
        } catch (err) {
            setError(fmt(err.response?.data) || "Could not create doctor.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="card shadow-sm p-4" style={{ width: 460 }}>
                <h3 className="text-center mb-3">Add Doctor</h3>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Username</label>
                            <input className="form-control" name="username" value={form.username} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">First name</label>
                            <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Last name</label>
                            <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} required/>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange}/>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-7">
                            <label className="form-label">Specialty</label>
                            <select className="form-select" name="specialty_id" value={form.specialty_id} onChange={handleChange} required>
                                <option value="">Select…</option>
                                {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">Phone</label>
                            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required/>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <div className="d-flex gap-2 mt-3">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
                        <button className="btn btn-primary ms-auto" disabled={submitting}>
                            {submitting ? "Creating…" : "Create doctor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function fmt(data) {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (data.detail && typeof data.detail === "string") return data.detail;
    return Object.entries(data).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(" ") : m}`).join("  ");
}
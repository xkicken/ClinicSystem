import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/axiosAPI";

const EMPTY = {
    first_name: "", last_name: "", phone: "", address: "",
    date_of_birth: "", gender: "", emergency_contact: "", emergency_contact_phone: "",
};

export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === "add";

    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isNew) return;
        api.get(`/patients/${id}/`)
            .then(res => setForm(res.data))
            .catch(() => setError("Could not load this patient."))
            .finally(() => setLoading(false));
    }, [id, isNew]);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            if (isNew) await api.post("/patients/", form);
            else await api.patch(`/patients/${id}/`, form);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data ? JSON.stringify(err.response.data) : "Could not save.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Delete this patient? This cannot be undone.")) return;
        setSaving(true);
        try {
            await api.delete(`/patients/${id}/`);
            navigate("/dashboard");
        } catch {
            setError("Could not delete.");
            setSaving(false);
        }
    }

    if (loading) return <p className="text-center mt-4">Loading…</p>;

    return (
        <div className="d-flex justify-content-center mt-4">
            <div className="card shadow-sm p-4" style={{ width: 520 }}>
                <h3 className="mb-3">{isNew ? "Add Patient" : "Edit Patient"}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
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
                        <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input className="form-control" name="phone"
                                   value={form.phone} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Date of birth</label>
                            <input type="date" className="form-control" name="date_of_birth"
                                   value={form.date_of_birth} onChange={handleChange} required/>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Address</label>
                            <input className="form-control" name="address"
                                   value={form.address} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Gender</label>
                            <select className="form-select" name="gender"
                                    value={form.gender} onChange={handleChange} required>
                                <option value="">Select…</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Emergency contact</label>
                            <input className="form-control" name="emergency_contact"
                                   value={form.emergency_contact} onChange={handleChange} required/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Emergency contact phone</label>
                            <input className="form-control" name="emergency_contact_phone"
                                   value={form.emergency_contact_phone} onChange={handleChange} required/>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

                    <div className="mt-4 d-flex gap-2 align-items-center">
                        <button type="button" className="btn btn-outline-secondary"
                                onClick={() => navigate(-1)}>‹ Back</button>
                        <button type="submit" className="btn btn-primary ms-auto" disabled={saving}>
                            {saving ? "Saving…" : isNew ? "Add patient" : "Save changes"}
                        </button>
                        {!isNew && (
                            <button type="button" className="btn btn-danger"
                                    onClick={handleDelete} disabled={saving}>
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
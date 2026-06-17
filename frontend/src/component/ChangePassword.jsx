import { useState } from "react";
import api from "../services/axiosAPI";

export default function ChangePassword() {
    const [form, setForm] = useState({ old_password: "", new_password: "", confirm: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
        setDone(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (form.new_password !== form.confirm) {
            setError("New passwords do not match.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await api.post("/auth/change-password/", {
                old_password: form.old_password,
                new_password: form.new_password,
            });
            setDone(true);
            setForm({ old_password: "", new_password: "", confirm: "" });
        } catch (err) {
            setError(err.response?.data?.detail || "Could not change password.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card shadow-sm p-4 mt-4" style={{ width: 480 }}>
            <h5 className="mb-3">Change Password</h5>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Current password</label>
                    <input type="password" className="form-control" name="old_password"
                           value={form.old_password} onChange={handleChange} required/>
                </div>
                <div className="mb-3">
                    <label className="form-label">New password</label>
                    <input type="password" className="form-control" name="new_password"
                           value={form.new_password} onChange={handleChange} required/>
                </div>
                <div className="mb-3">
                    <label className="form-label">Confirm new password</label>
                    <input type="password" className="form-control" name="confirm"
                           value={form.confirm} onChange={handleChange} required/>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {done && <div className="alert alert-success">Password changed.</div>}

                <button className="btn btn-primary w-100" disabled={saving}>
                    {saving ? "Saving…" : "Change password"}
                </button>
            </form>
        </div>
    );
}
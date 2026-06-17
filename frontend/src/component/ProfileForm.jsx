import { useEffect, useState } from "react";
import api from "../services/axiosAPI";

export default function ProfileForm({ id }) {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "", phone: "", address: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get(`/profiles/${id}/`)
            .then(res => {
                setProfile(res.data);
                setForm({
                    first_name: res.data.user.first_name || "",
                    last_name: res.data.user.last_name || "",
                    email: res.data.user.email || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                });
            })
            .catch(() => setError("Could not load this profile."))
            .finally(() => setLoading(false));
    }, [id]);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await api.patch(`/profiles/${id}/`, {
                user: {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                },
                phone: form.phone,
                address: form.address,
            });
            setProfile(res.data);
            setSaved(true);
        } catch {
            setError("Could not save your profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="text-center">Loading…</p>;
    if (error && !profile) return <p className="text-center text-danger">{error}</p>;
    if (!profile) return null;

    const { user } = profile;

    return (
        <div className="card shadow-sm p-4" style={{ width: 480 }}>
            <div className="text-center mb-3">
                <h3 className="mb-0">{user.first_name} {user.last_name}</h3>
                <small className="text-muted">@{user.username}</small>
            </div>

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
                    <div className="col-12">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" name="email"
                               value={form.email} onChange={handleChange}/>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input className="form-control" name="phone"
                               value={form.phone} onChange={handleChange}/>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Address</label>
                        <input className="form-control" name="address"
                               value={form.address} onChange={handleChange}/>
                    </div>
                </div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {saved && <div className="alert alert-success mt-3">Profile updated.</div>}

                <button className="btn btn-primary w-100 mt-3" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </form>
        </div>
    );
}
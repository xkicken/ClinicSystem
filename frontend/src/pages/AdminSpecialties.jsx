import { useEffect, useState } from "react";
import api from "../services/axiosAPI";

export default function AdminSpecialties() {
    const [specialties, setSpecialties] = useState([]);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        api.get("/specialties/")
            .then(res => setSpecialties(res.data))
            .catch(() => setError("Could not load specialties."))
            .finally(() => setLoading(false));
    }
    useEffect(load, []);

    async function addSpecialty(e) {
        e.preventDefault(); setError("");
        if (!newName.trim()) return;
        try {
            await api.post("/specialties/", { name: newName.trim() });
            setNewName("");
            load();
        } catch (err) { setError(err.response?.data?.detail || "Could not add specialty."); }
    }
    async function saveEdit(id) {
        setError("");
        try {
            await api.patch(`/specialties/${id}/`, { name: editName.trim() });
            setEditingId(null);
            load();
        } catch (err) { setError(err.response?.data?.detail || "Could not save."); }
    }
    async function remove(id) {
        if (!window.confirm("Delete this specialty?")) return;
        setError("");
        try { await api.delete(`/specialties/${id}/`); load(); }
        catch (err) { setError(err.response?.data?.detail || "Could not delete."); }
    }

    if (loading) return <p className="text-center mt-4">Loading…</p>;

    return (
        <div className="container py-4" style={{ maxWidth: 600 }}>
            <h3 className="fw-bold text-center mb-4">Specialties</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form className="d-flex gap-2 mb-4" onSubmit={addSpecialty}>
                <input className="form-control" placeholder="New specialty name"
                       value={newName} onChange={e => setNewName(e.target.value)} required/>
                <button className="btn btn-success">Add</button>
            </form>

            <ul className="list-group">
                {specialties.map(s => (
                    <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {editingId === s.id ? (
                            <>
                                <input className="form-control form-control-sm me-2"
                                       value={editName} onChange={e => setEditName(e.target.value)}/>
                                <span className="d-flex gap-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => saveEdit(s.id)}>Save</button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                </span>
                            </>
                        ) : (
                            <>
                                <span>{s.name}</span>
                                <span className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-secondary"
                                            onClick={() => { setEditingId(s.id); setEditName(s.name); }}>Edit</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(s.id)}>Delete</button>
                                </span>
                            </>
                        )}
                    </li>
                ))}
                {specialties.length === 0 && <li className="list-group-item text-muted text-center">No specialties yet.</li>}
            </ul>
        </div>
    );
}
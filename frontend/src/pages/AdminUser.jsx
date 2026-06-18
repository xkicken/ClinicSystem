import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosAPI";

const EMPTY_PATIENT = {
    first_name: "", last_name: "", phone: "", address: "",
    date_of_birth: "", gender: "", emergency_contact: "", emergency_contact_phone: "",
};

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ username: "", first_name: "", last_name: "", email: "" });

    const [addingUser, setAddingUser] = useState(false);
    const [newUser, setNewUser] = useState({ username: "", first_name: "", last_name: "", email: "", password: "" });

    const [addPatientFor, setAddPatientFor] = useState(null);
    const [newPatient, setNewPatient] = useState(EMPTY_PATIENT);

    function load() {
        setLoading(true);
        api.get("/users/")
            .then(res => setUsers(res.data))
            .catch(() => setError("Could not load users."))
            .finally(() => setLoading(false));
    }
    useEffect(load, []);

    async function createUser(e) {
        e.preventDefault();
        try {
            await api.post("/users/", newUser);
            setAddingUser(false);
            setNewUser({ username: "", first_name: "", last_name: "", email: "", password: "" });
            load();
        } catch (err) {
            setError(fmt(err.response?.data) || "Could not create user.");
        }
    }

    async function createPatient(e) {
        e.preventDefault();
        try {
            await api.post(`/users/${addPatientFor}/patients/`, newPatient);
            setAddPatientFor(null);
            setNewPatient(EMPTY_PATIENT);
            load();
        } catch (err) {
            setError(err.response?.data?.detail || fmt(err.response?.data) || "Could not add patient.");
        }
    }

    function startEdit(u) {
        setEditingId(u.user.id);
        setEditForm({ username: u.user.username, first_name: u.user.first_name,
            last_name: u.user.last_name, email: u.user.email });
        setError("");
    }
    async function saveEdit() {
        try { await api.patch(`/users/${editingId}/`, editForm); setEditingId(null); load(); }
        catch (err) { setError(err.response?.data?.detail || "Could not save changes."); }
    }
    async function toggleActive(u) {
        try { await api.patch(`/users/${u.user.id}/`, { is_active: !u.is_active }); load(); }
        catch (err) { setError(err.response?.data?.detail || "Could not update user."); }
    }
    async function deleteUser(u) {
        if (!window.confirm(`Delete ${u.user.username}? This removes their patients too.`)) return;
        try { await api.delete(`/users/${u.user.id}/`); load(); }
        catch (err) { setError(err.response?.data?.detail || "Could not delete user."); }
    }
    async function deletePatient(pid) {
        if (!window.confirm("Delete this patient?")) return;
        try { await api.delete(`/patients/${pid}/`); load(); }
        catch { setError("Could not delete patient."); }
    }

    const set = (setter) => (e) => setter(prev => ({ ...prev, [e.target.name]: e.target.value }));

    if (loading) return <p className="text-center mt-4">Loading…</p>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">User Management</h3>
                <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={() => setAddingUser(v => !v)}>
                        {addingUser ? "Cancel" : "+ Add User"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {addingUser && (
                <form className="card shadow-sm mb-4 p-3" onSubmit={createUser}>
                    <h6 className="mb-3">New User</h6>
                    <div className="row g-2">
                        <div className="col-md-4"><input className="form-control form-control-sm" name="username"
                            placeholder="Username" value={newUser.username} onChange={set(setNewUser)} required/></div>
                        <div className="col-md-4"><input className="form-control form-control-sm" name="first_name"
                            placeholder="First name" value={newUser.first_name} onChange={set(setNewUser)} required/></div>
                        <div className="col-md-4"><input className="form-control form-control-sm" name="last_name"
                            placeholder="Last name" value={newUser.last_name} onChange={set(setNewUser)} required/></div>
                        <div className="col-md-6"><input type="email" className="form-control form-control-sm" name="email"
                            placeholder="Email" value={newUser.email} onChange={set(setNewUser)}/></div>
                        <div className="col-md-6"><input type="password" className="form-control form-control-sm" name="password"
                            placeholder="Password" value={newUser.password} onChange={set(setNewUser)} required/></div>
                    </div>
                    <div className="mt-2"><button className="btn btn-sm btn-primary">Create user</button></div>
                </form>
            )}

            {users.length === 0 && <p className="text-muted text-center">No users.</p>}

            {users.map(u => {
                const editing = editingId === u.user.id;
                const addingP = addPatientFor === u.user.id;
                return (
                    <div key={u.user.id} className="card shadow-sm mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{u.user.first_name} {u.user.last_name}</span>
                                <span className="text-muted ms-2">@{u.user.username}</span>
                                {!u.is_active && <span className="badge bg-secondary ms-2">Inactive</span>}
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(u)}>Edit</button>
                                <button className={`btn btn-sm ${u.is_active ? "btn-outline-warning" : "btn-outline-success"}`}
                                        onClick={() => toggleActive(u)}>{u.is_active ? "Deactivate" : "Activate"}</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u)}>Delete</button>
                            </div>
                        </div>
                        <div className="card-body">
                            {editing ? (
                                <div className="row g-2 mb-3">
                                    <div className="col-md-6"><label className="form-label small">Username</label>
                                        <input className="form-control form-control-sm" name="username"
                                               value={editForm.username} onChange={set(setEditForm)}/></div>
                                    <div className="col-md-6"><label className="form-label small">Email</label>
                                        <input className="form-control form-control-sm" name="email"
                                               value={editForm.email} onChange={set(setEditForm)}/></div>
                                    <div className="col-md-6"><label className="form-label small">First name</label>
                                        <input className="form-control form-control-sm" name="first_name"
                                               value={editForm.first_name} onChange={set(setEditForm)}/></div>
                                    <div className="col-md-6"><label className="form-label small">Last name</label>
                                        <input className="form-control form-control-sm" name="last_name"
                                               value={editForm.last_name} onChange={set(setEditForm)}/></div>
                                    <div className="col-12 d-flex gap-2 mt-2">
                                        <button className="btn btn-sm btn-primary" onClick={saveEdit}>Save</button>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted small mb-2">{u.user.email}</div>
                            )}

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Patients ({u.patients.length})</h6>
                                <button className="btn btn-sm btn-outline-success"
                                        onClick={() => { setAddPatientFor(addingP ? null : u.user.id); setNewPatient(EMPTY_PATIENT); }}>
                                    {addingP ? "Cancel" : "+ Add patient"}
                                </button>
                            </div>

                            {addingP && (
                                <form className="border rounded p-2 mb-3" onSubmit={createPatient}>
                                    <div className="row g-2">
                                        <div className="col-md-6"><input className="form-control form-control-sm" name="first_name"
                                            placeholder="First name" value={newPatient.first_name} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-md-6"><input className="form-control form-control-sm" name="last_name"
                                            placeholder="Last name" value={newPatient.last_name} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-md-6"><input className="form-control form-control-sm" name="phone"
                                            placeholder="Phone" value={newPatient.phone} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-md-6"><input type="date" className="form-control form-control-sm" name="date_of_birth"
                                            value={newPatient.date_of_birth} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-12"><input className="form-control form-control-sm" name="address"
                                            placeholder="Address" value={newPatient.address} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-md-6">
                                            <select className="form-select form-select-sm" name="gender"
                                                    value={newPatient.gender} onChange={set(setNewPatient)} required>
                                                <option value="">Gender…</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6"><input className="form-control form-control-sm" name="emergency_contact"
                                            placeholder="Emergency contact" value={newPatient.emergency_contact} onChange={set(setNewPatient)} required/></div>
                                        <div className="col-md-6"><input className="form-control form-control-sm" name="emergency_contact_phone"
                                            placeholder="Emergency phone" value={newPatient.emergency_contact_phone} onChange={set(setNewPatient)} required/></div>
                                    </div>
                                    <div className="mt-2"><button className="btn btn-sm btn-primary">Add patient</button></div>
                                </form>
                            )}

                            {u.patients.length === 0 ? (
                                <p className="text-muted small mb-0">No patients.</p>
                            ) : (
                                <ul className="list-group">
                                    {u.patients.map(p => (
                                        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{p.first_name} {p.last_name} · {p.phone}</span>
                                            <span className="d-flex gap-2">
                                                <Link to={`/patient/${p.id}`} className="btn btn-sm btn-outline-secondary">Edit</Link>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deletePatient(p.id)}>Delete</button>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function fmt(data) {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (data.detail && typeof data.detail === "string") return data.detail;
    return Object.entries(data)
        .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(" ") : m}`)
        .join("  ");
}
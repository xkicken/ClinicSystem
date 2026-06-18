import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosAPI";

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        api.get("/doctors/")
            .then(res => setDoctors(res.data))
            .catch(() => setError("Could not load doctors."))
            .finally(() => setLoading(false));
    }
    useEffect(load, []);

    async function deleteDoctor(id) {
        if (!window.confirm("Delete this doctor?")) return;
        try { await api.delete(`/doctors/${id}/`); load(); }
        catch { setError("Could not delete doctor."); }
    }

    if (loading) return <p className="text-center mt-4">Loading…</p>;
    if (error) return <p className="text-center mt-4 text-danger">{error}</p>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Doctor Management</h3>
                <div className="d-flex gap-2">
                    <Link to="/add-doctor" className="btn btn-success btn-sm">+ Add Doctor</Link>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table mb-0 align-middle">
                        <thead><tr><th>Name</th><th>Specialty</th><th>Phone</th><th></th></tr></thead>
                        <tbody>
                            {doctors.map(d => (
                                <tr key={d.id}>
                                    <td>Dr. {d.account.first_name} {d.account.last_name}</td>
                                    <td>{d.specialty?.name}</td>
                                    <td>{d.phone}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-danger"
                                                onClick={() => deleteDoctor(d.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-muted">No doctors.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
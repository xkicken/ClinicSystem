import {useEffect, useState} from 'react'
import api from '../services/axiosAPI'

export default function UserDashboard() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard/user/')
            .then(res => setData(res.data))
            .catch(err => console.error('dashboard load failed', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <div className="container pt-4">
                <h2 className="fw-bold text-center">Patient Dashboard</h2>
                <p className="text-muted text-center">Manage your patients and appointments</p>
            </div>
            {data.length === 0 && <p>No patients added yet.</p>}
            <div className="container pb-5 d-flex justify-content-center">
                <div className="card shadow-sm border-0 w-100" style={{maxWidth: '1000px'}}>
                    <div className="card-body">
                        {data.map(({patient, next_appointment}) => (
                            <div key={patient.id}
                                 className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 border bg-body">
                                <div>
                                    <div class="fw-semibold fs-5">
                                        {patient.first_name} {patient.last_name}
                                    </div>

                                    {next_appointment ? (
                                        <div className="text-muted small">
                                            Next appointment:
                                            <p>
                                                Dr. {next_appointment.time_slot.doctor} — {next_appointment.time_slot.date} at {next_appointment.time_slot.start_time}
                                            </p>
                                            <a href={`/appointment/${next_appointment.id}`}>View</a>
                                        </div>
                                    ) : (
                                        <div className="text-muted small">
                                            No upcoming appointments.
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex gap-2">
                                    <a href={`/booking?patient=${patient.id}`}
                                       className="btn btn-outline-primary btn-sm rounded-pill">Book now</a>
                                    <a href={`/patient/${patient.id}`} className="btn btn-primary btn-sm rounded-pill">Edit
                                        patient</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <a href="/patient/add" className="text-success fw-bold">+ Add patient</a>
        </div>
    )
}
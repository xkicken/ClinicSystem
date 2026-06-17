import {useEffect, useState} from 'react'
import api from '../services/axiosAPI'
import {Link} from 'react-router-dom'

export default function PatientCard({patient}) {
    const [next, setNext] = useState(null)
    const [loadingNext, setLoadingNext] = useState(true)

    useEffect(() => {
        api.get(`/patient/${patient.id}/appointment/next/`)
            .then(res => setNext(res.data.next_appointment))
            .catch(err => console.error('next appointment load failed', err))
            .finally(() => setLoadingNext(false))
    }, [patient.id])

    return (
        <div className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 border bg-body">
            <div>

                <div className="fw-semibold fs-5">
                    {patient.first_name} {patient.last_name}
                </div>

                {loadingNext ? (
                    <p>Loading appointment…</p>
                ) : next ? (
                    <div className="text-muted small">
                        Next appointment:
                        <p className={"mb-0"}>
                            Dr. {next.time_slot.doctor_name} — {next.time_slot.date} at {next.time_slot.start_time} <Link to={`/appointment/${next.id}`} className="btn btn-info btn-xs mb-1 rounded-pill">View</Link>
                        </p>
                    </div>

                ) : (
                    <div className="text-muted small">
                        No upcoming appointments.
                    </div>
                )
                }
            </div>
            <div>
                <div className="d-flex gap-2">
                    <Link to={`/booking?patient=${patient.id}`} className="btn btn-outline-primary btn-sm rounded-pill">Book</Link>
                    <Link to={`/patient/${patient.id}`} className="btn btn-primary btn-sm rounded-pill">Patient Details</Link>
                </div>
            </div>
        </div>
    )
}
import {useEffect, useState} from 'react'
import api from '../services/axiosAPI'
import PatientCard from '../component/PatientCard'

export default function UserDashboard() {
    const [data, setdata] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard/user/')
            .then(res => setdata(res.data))
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
            <div className="container pb-2 d-flex justify-content-center">
                <div className="card shadow-sm border-0 w-100" style={{maxWidth: '1000px'}}>
                    <div className="card-body">
                        {data.map(patient => (
                            <PatientCard key={patient.id} patient={patient}/>
                        ))}
                    </div>
                </div>
            </div>
            <div className="container pt-4 text-center">
                <a href="/patient/add" className="text-success fw-bold">+ Add patient</a>
            </div>
        </div>
    )
}


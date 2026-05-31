import { useEffect, useState } from 'react'
import client from '../api/client'

export default function UserDashboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/dashboard/user/')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>My Dashboard</h1>
      {data.length === 0 && <p>No patients added yet.</p>}
      {data.map(({ patient, next_appointment }) => (
        <div key={patient.id} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
          <h2>{patient.first_name} {patient.last_name}</h2>
          <p>{patient.phone} · {patient.date_of_birth}</p>

          {next_appointment ? (
            <div>
              <strong>Next appointment:</strong>
              <p>
                Dr. {next_appointment.time_slot.doctor} — {next_appointment.time_slot.date} at {next_appointment.time_slot.start_time}
              </p>
              <a href={`/appointment/${next_appointment.id}`}>View</a>
            </div>
          ) : (
            <p>No upcoming appointments. <a href={`/booking?patient=${patient.id}`}>Book now</a></p>
          )}

          <a href={`/patient/${patient.id}`}>Edit patient</a>
        </div>
      ))}

      <a href="/patient/add">+ Add patient</a>
    </div>
  )
}
Models
- Patient
  - Patient ID
  - First Name
  - Last Name
  - Email
  - Phone
  - Address
  - DOB
  - Gender
  - Insurance
  - Emergency Contact
  - Emergency Contact Phone
- Doctor
  - Doctor ID
  - First Name
  - Last Name
  - Email
  - Phone
  - Specialty
- Appointment
  - Appointment ID
  - Appointment Date
  - Appointment Time
  - Patient ID
  - Doctor ID
  - Appointment Status
- User
  - Username
  - Password
  - Role

erDiagram
    USER ||--o{ PATIENT : has
    PATIENT ||--o{ APPOINTMENT : books
    APPOINTMENT }o--|| APPOINTMENT_SLOT : uses
    DOCTOR ||--o{ APPOINTMENT_SLOT : provides

    USER {
        int id
        string username
        string email
        string password
        bool is_staff
    }
    PATIENT {
        int id
        string name
        date dob
        string phone
    }
    APPOINTMENT {
        int id
        string status
    }
    APPOINTMENT_SLOT {
        int id
        datetime start_time
        datetime end_time
        bool is_booked
    }
    DOCTOR {
        int id
        string name
        string specialty
    }
Views
- Patient Views
- Doctor Views
- Admin Views
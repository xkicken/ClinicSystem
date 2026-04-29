# ClinicSystem

A comprehensive Django-based clinic management system for handling appointments, patients, doctors, and medical schedules.

## Overview

ClinicSystem is a web application designed to streamline clinic operations by providing:
- Patient management and registration
- Doctor scheduling and availability management
- Appointment booking and tracking
- User authentication and role-based access
- Calendar integration for appointment visualization

## Features

### Core Functionality
- **Multi-role Authentication**: Support for patients, doctors, and administrative staff
- **Patient Management**: Complete patient profiles with medical history and contact information
- **Doctor Management**: Doctor profiles with specialties and availability
- **Appointment Scheduling**: Book, cancel, and manage appointments with time slot management
- **Calendar View**: Interactive calendar for viewing appointments by role (doctor/patient)
- **User Profiles**: Personal profile management with profile pictures

### Technical Features
- **PostgreSQL Database**: Robust database backend for data persistence
- **Role-based Access Control**: Different dashboards and functionality based on user roles
- **Responsive Design**: Mobile-friendly interface using modern HTML/CSS
- **Admin Hijack Support**: Administrative tools for user management
- **Environment Configuration**: Secure configuration using environment variables

## Technology Stack

- **Backend**: Django 6.0.4
- **Database**: PostgreSQL with psycopg3
- **Authentication**: Django's built-in auth system with django-hijack
- **Image Processing**: Pillow for profile picture handling
- **Environment Management**: python-dotenv
- **Deployment**: Vercel configuration included

## Project Structure

```
ClinicSystem/
├── ClinicSystem/          # Main Django project directory
│   ├── settings.py        # Django settings and configuration
│   ├── urls.py           # Main URL routing
│   └── wsgi.py           # WSGI configuration
├── appointment/          # Core app for clinic functionality
│   ├── models.py         # Database models (Patient, Doctor, Appointment, etc.)
│   ├── views.py          # View functions and logic
│   ├── admin.py          # Django admin configuration
│   └── migrations/       # Database migrations
├── templates/            # HTML templates
│   └── appointment/      # App-specific templates
├── static/              # Static files (CSS, JS, images)
├── media/               # User-uploaded media files
├── requirements.txt     # Python dependencies
├── manage.py           # Django management script
└── vercel.json         # Vercel deployment configuration
```

## Database Models

### Core Models
- **User**: Django's built-in user model (extended with UserProfile)
- **Specialty**: Medical specialties for doctors
- **Patient**: Patient information linked to user accounts
- **Doctor**: Doctor profiles with specialties
- **TimeSlot**: Available appointment time slots for doctors
- **Appointment**: Booked appointments linking patients to time slots
- **UserProfile**: Extended user information with profile pictures

### Key Relationships
- One user account can have multiple patients
- Each doctor has one specialty
- Each appointment links one patient to one time slot
- Time slots are specific to doctors and dates

## Installation and Setup

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Virtual environment (recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ClinicSystem
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Unix/MacOS
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   PGDATABASE=your_database_name
   PGUSER=your_database_user
   PGPASSWORD=your_database_password
   PGHOST=localhost
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Load initial data (optional)**
   ```bash
   python manage.py loaddata appointment/fixtures/initial_data.json
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

The application will be available at `http://127.0.0.1:8000/`

## Deployment

### Vercel Deployment
The project includes `vercel.json` configuration for deployment to Vercel. The configuration handles:
- Python runtime setup
- WSGI application routing
- CORS headers for API access

### Environment Variables for Production
Ensure the following environment variables are set in your deployment environment:
- `PGDATABASE`
- `PGUSER` 
- `PGPASSWORD`
- `PGHOST`
- `SECRET_KEY` (use a secure, production-grade key)

## Usage

### User Roles and Access

1. **Patients**:
   - Register and manage multiple patient profiles
   - Book appointments with available doctors
   - View appointment history and upcoming appointments
   - Manage personal information

2. **Doctors**:
   - View and manage their schedule
   - See patient appointments
   - Update availability and time slots
   - Access patient information for scheduled appointments

3. **Administrators**:
   - Full system access via Django admin
   - User management with hijack functionality
   - System configuration and oversight

### Key Workflows

1. **Booking an Appointment**:
   - Patient logs in and selects a specialty
   - Available doctors and time slots are displayed
   - Patient selects time slot and confirms booking
   - Appointment is created and visible in calendar

2. **Doctor Schedule Management**:
   - Doctor accesses their dashboard
   - View upcoming appointments in calendar format
   - Manage availability through time slots

## API Endpoints

The application uses Django's traditional request/response pattern with the following main views:
- `/` - Home page with doctor listings
- `/profile/` - User profile management
- `/doctor_dashboard/` - Doctor-specific dashboard
- `/patient_dashboard/` - Patient-specific dashboard
- `/calendar/` - Calendar view for appointments (role-based)

## Security Considerations

- User authentication required for most functionality
- Role-based access control implemented
- Environment variables used for sensitive configuration
- PostgreSQL connection secured with proper credentials
- CSRF protection enabled
- Security middleware configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the Django documentation for framework-specific questions
- Review the code comments for implementation details
- Create an issue for bugs or feature requests

## Future Enhancements

Potential areas for improvement:
- Email notifications for appointments
- SMS reminders
- Telemedicine integration
- Advanced reporting and analytics
- Mobile application
- Payment processing integration
- Electronic health records (EHR) integration

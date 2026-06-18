import {BrowserRouter, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {useAuth} from "./context/useAuth.js";
import NavBar from "./component/NavBar.jsx";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import NewAppointment from "./pages/NewAppointment";
import AppointmentDetails from "./pages/AppointmentDetails";
import PatientDetail from "./pages/PatientDetail";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import BookingConfirm from "./pages/BookingConfirm"
import DoctorDashboard from "./pages/DoctorDashboard";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDoctor from "./pages/AdminDoctor";
import AdminUser from "./pages/AdminUser";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent/>
            </BrowserRouter>
        </AuthProvider>
    );
}

function AppContent() {
    const {user, logout} = useAuth();

    return (
        <>
            <NavBar
                group={user?.group || "guest"}
                id={user?.id}
                firstName={user?.firstName}
                lastName={user?.lastName}
                isAuthenticated={!!user}
                onLogout={logout}
            />
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/user-dashboard" element={<UserDashboard/>}/>
                <Route path="/doctor-dashboard" element={<DoctorDashboard/>}/>
                {/*<Route path="/admin-dashboard"  element={<AdminDashboard/>}/>*/}
                <Route path="/login" element={<Login/>}/>
                <Route path="/booking" element={<NewAppointment/>}/>
                <Route path="/appointment/:id" element={<AppointmentDetails/>}/>
                <Route path="/patient/add" element={<PatientDetail/>}/>
                <Route path="/patient/:id" element={<PatientDetail/>}/>
                <Route path="/profile/:id" element={<Profile/>}/>
                <Route path="/calendar" element={<Calendar/>}/>
                <Route path="/booking/confirm" element={<BookingConfirm/>}/>
                <Route path="/doctor-dashboard" element={<DoctorDashboard/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/admin-doctor" element={<AdminDoctor/>}/>
                <Route path="/admin/doctor" element={<AdminDoctor/>}/>
                <Route path="/admin/users" element={<AdminUser/>}/>
            </Routes>
        </>
    );
}

export default App;
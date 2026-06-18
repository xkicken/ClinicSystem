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
import {useNavigate} from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute.jsx";
import AdminTimeSlots from "./pages/AdminTimeSlots";

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
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/home");
    }

    return (
        <>
            <NavBar
                group={user?.group || "guest"}
                id={user?.id}
                firstName={user?.firstName}
                lastName={user?.lastName}
                isAuthenticated={!!user}
                onLogout={handleLogout}
            />
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>

                <Route element={<ProtectedRoute/>}>
                    <Route path="/booking" element={<NewAppointment/>}/>
                    <Route path="/booking/confirm" element={<BookingConfirm/>}/>
                    <Route path="/appointment/:id" element={<AppointmentDetails/>}/>
                    <Route path="/patient/add" element={<PatientDetail/>}/>
                    <Route path="/patient/:id" element={<PatientDetail/>}/>
                    <Route path="/profile/:id" element={<Profile/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                </Route>

                <Route element={<ProtectedRoute roles={["User"]}/>}>
                    <Route path="/dashboard/user" element={<UserDashboard/>}/>
                </Route>
                <Route element={<ProtectedRoute roles={["Doctor"]}/>}>
                    <Route path="/dashboard/doctor" element={<DoctorDashboard/>}/>
                </Route>

                <Route element={<ProtectedRoute roles={["Admin"]}/>}>
                    <Route path="/admin/doctor" element={<AdminDoctor/>}/>
                    <Route path="/admin/users" element={<AdminUser/>}/>
                    <Route path="/admin/timeslots" element={<AdminTimeSlots/>}/>
                </Route>

            </Routes>
        </>
    );
}

export default App;
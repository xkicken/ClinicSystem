import {BrowserRouter, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {useAuth} from "./context/useAuth.js";
import Navbar from "./component/Navbar";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import NewAppointment from "./pages/NewAppointment";
import AppointmentDetails from "./pages/AppointmentDetails";

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
            <Navbar
                group={user?.group || "guest"}
                id={user?.id}
                firstName = {user?.firstName}
                lastName = {user?.lastName}
                isAuthenticated={!!user}
                onLogout={logout}
            />
            <Routes>
                <Route path="/userdashboard" element={<UserDashboard/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/booking" element={<NewAppointment/>}/>
                <Route path="/appointment/:id" element={<AppointmentDetails/>}/>
            </Routes>
        </>
    );
}

export default App;
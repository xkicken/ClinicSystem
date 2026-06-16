import {BrowserRouter, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {useAuth} from "./context/useAuth.js";
import Navbar from "./component/Navbar";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";

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
                <Route path="/dashboard" element={<UserDashboard/>}/>
                <Route path="/login" element={<Login/>}/>
            </Routes>
        </>
    );
}

export default App;
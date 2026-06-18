import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ roles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.group)) return <Navigate to="/" replace />;

    return <Outlet />;
}
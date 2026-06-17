import {useState, useEffect} from "react";
import {checkAuth, login as loginService, logout as logoutService} from "../services/authService";
import {AuthContext} from "./authContextObject.js"

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth()
            .then(setUser)
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        setError(null);
        try {
            await loginService(username, password);
            const userData = await checkAuth();
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        await logoutService();
        setUser(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-body">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{user, login, logout, error}}>
            {children}
        </AuthContext.Provider>
    );
}
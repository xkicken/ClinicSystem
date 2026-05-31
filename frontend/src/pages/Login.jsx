import {useState} from "react";
import {Link} from "react-router-dom";
import {apiFetch} from "../api";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [credentials, setCredentials] = useState({username: "", password: ""});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    function handleChange(e) {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                setError("Invalid username or password");
            } else {
                const data = await res.json();
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                navigate("/dashboard");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: "80vh"}}>
            <div className="card shadow-sm p-4" style={{width: 350}}>
                <h3 className="text-center mb-3">Login</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    <button className="btn btn-primary w-100 mb-3" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="text-center">
                        <small className="text-muted">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary text-decoration-none">
                                Register here
                            </Link>
                        </small>
                    </div>
                </form>
            </div>
        </div>
    );
}
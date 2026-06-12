import ThemeToggle from "./ThemeToggle";
import { NavLink } from "react-router-dom";

// Usage: <Navbar user={user} onLogout={handleLogout} />
// user shape: { id, fullName, groupName, isAuthenticated }

const getNavLinks = (id) => ({
  guest: [
    { to: "/", label: "Home" },
  ],
  User: [
    { to: "/", label: "Home" },
    { to: `/profile/${id}`, label: "Profile" },
    { to: "/user-dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/add-patient", label: "+ Add Patient", className: "text-success fw-bold" },
  ],
  Doctor: [
    { to: "/", label: "Home" },
    { to: `/profile/${id}`, label: "Profile" },
    { to: "/doctor-dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
  ],
  Admin: [
    { to: "/", label: "Home" },
    { to: `/profile/${id}`, label: "Profile" },
    { to: "/admin-dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/add-doctor", label: "+ Add Doctor", className: "text-success fw-bold" },
  ],
});

function Navbar({ role, id, fullName, isAuthenticated, onLogout }) {
  const links = getNavLinks(id)[role] || getNavLinks(id).guest;

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">

        <NavLink className="navbar-brand" to="/">Clinic System</NavLink>

        <button className="navbar-toggler" type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"/>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav">
            {links.map(link => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  className={`nav-link ${link.className || ""}`}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <span className="navbar-text ms-3 px-3 py-1 border-start border-2">
            {isAuthenticated
              ? `Welcome ${role === "Doctor" ? "Dr." : ""}${fullName}`
              : "Welcome Guest"}
          </span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <ThemeToggle/>

            {isAuthenticated ? (
              <button className="btn btn-danger" onClick={onLogout}>
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-outline-success">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

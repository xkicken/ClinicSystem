import ThemeToggle from "./ThemeToggle.jsx";
import { NavLink } from "react-router-dom";

const getNavLinks = (id) => ({
  guest: [
    { to: "/", label: "Home" },
  ],
  User: [
    { to: "/", label: "Home" },
    { to: `/profile/${id}`, label: "Profile" },
    { to: "/user-dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
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

  ],
});

function NavBar({ id, group, firstName, lastName, isAuthenticated, onLogout }) {
  const links = getNavLinks(id)[group] || getNavLinks(id).guest;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
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
              ? `Welcome ${group === "Doctor" ? "Dr." : ""}${firstName} ${lastName}`
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

export default NavBar;

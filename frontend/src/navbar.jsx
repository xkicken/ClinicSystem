import React from "react";
import ThemeToggle from "./ThemeToggle";
// Usage: <Navbar user={user} onLogout={handleLogout} />
// user shape: { id, fullName, groupName, isAuthenticated }

export default function Navbar({ user, onLogout }) {
  const { isAuthenticated, fullName, groupName, id } = user ?? {};

  function getDashboardHref() {
    if (groupName === "Doctor") return "/doctor-dashboard";
    if (groupName === "User")   return "/user-dashboard";
    return "/admin-dashboard";
  }

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">

        <a className="navbar-brand" href="/">Clinic System</a>

        <button className="navbar-toggler" type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="/">Home</a>
            </li>

            {isAuthenticated && (<>
              <li className="nav-item">
                <a className="nav-link" href={`/profile/${id}`}>
                  Profile
                </a>
              </li>

              {groupName && (
                <li className="nav-item">
                  <a className="nav-link" href={getDashboardHref()}>
                    Dashboard
                  </a>
                </li>
              )}

              <li className="nav-item">
                <a className="nav-link" href="/calendar">Calendar</a>
              </li>

              {groupName === "User" && (
                <li className="nav-item">
                  <a className="nav-link text-success fw-bold"
                    href="/add-patient">+ Add Patient</a>
                </li>
              )}

              {groupName === "Admin" && (
                <li className="nav-item">
                  <a className="nav-link text-success fw-bold"
                    href="/add-doctor">+ Add Doctor</a>
                </li>
              )}
            </>)}
          </ul>

          <span className="navbar-text ms-3 px-3 py-1 border-start border-2">
            {isAuthenticated
              ? `Welcome ${groupName === "Doctor" ? "Dr." : ""}${fullName}`
              : "Welcome Guest"}
          </span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <button className="btn btn-danger"
                onClick={onLogout}>
                Logout
              </button>
            ) : (
              <a href="/login" className="btn btn-outline-success">
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
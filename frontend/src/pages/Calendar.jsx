import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosAPI";

const DAYS_PER_PAGE = 5;
const HALF = Math.floor(DAYS_PER_PAGE / 2);

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0); // 0 = window centered on today
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/calendar/")
            .then(res => setEvents(res.data))
            .catch(() => setError("Could not load your calendar."))
            .finally(() => setLoading(false));
    }, []);

    const eventsByDate = useMemo(() => {
        const map = {};
        const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
        for (const e of sorted) {
            const date = e.start.split("T")[0];
            (map[date] ||= []).push(e);
        }
        return map;
    }, [events]);

    const todayKey = useMemo(() => toKey(new Date()), []);

    const dates = useMemo(() => {
        const set = new Set(Object.keys(eventsByDate));
        set.add(todayKey);
        return [...set].sort();
    }, [eventsByDate, todayKey]);

    const todayIndex = dates.indexOf(todayKey);

    const start = todayIndex - HALF + page * DAYS_PER_PAGE;
    const visibleDates = dates.slice(Math.max(0, start), Math.max(0, start) + DAYS_PER_PAGE);
    const hasPrev = start > 0;
    const hasNext = start + DAYS_PER_PAGE < dates.length;

    if (loading) return <p className="text-center mt-4">Loading…</p>;
    if (error) return <p className="text-center mt-4 text-danger">{error}</p>;

    return (
        <div className="container py-4">
            <h3 className="text-center mb-4">My Calendar</h3>

            <div style={{ height: 420, overflowY: "auto", overflowX: "auto" }}>
                <div className="d-flex gap-3 justify-content-center flex-nowrap">
                    {visibleDates.map(key => {
                        const dayEvents = eventsByDate[key] || [];
                        const isToday = key === todayKey;
                        return (
                            <div key={key}
                                 className={`card shadow-sm ${isToday ? "border-primary border-2" : ""}`}
                                 style={{ minWidth: 170 }}>
                                <div className={`card-header text-center fw-semibold ${isToday ? "text-bg-primary" : ""}`}
                                     style={{
                                         position: "sticky", top: 0, zIndex: 2,
                                         backgroundColor: isToday ? undefined : "var(--bs-card-bg)",
                                     }}>
                                    {formatDate(key)}{isToday ? " • Today" : ""}
                                </div>
                                <div className="card-body d-flex flex-column gap-2">
                                    {dayEvents.length === 0 ? (
                                        <span className="text-muted small text-center">No appointments</span>
                                    ) : (
                                        dayEvents.map(ev => {
                                            const cancelled = ev.status === "CANCELLED";
                                            return (
                                                <Link key={ev.id} to={`/appointment/${ev.id}`}
                                                      className={`btn btn-sm text-start ${cancelled ? "btn-outline-danger" : "btn-outline-primary"}`}>
                                                    <div className={`fw-semibold ${cancelled ? "text-decoration-line-through" : ""}`}>
                                                        {formatTime(ev.start)}
                                                    </div>
                                                    <div className="small">
                                                        {ev.title}{cancelled ? " (Cancelled)" : ""}
                                                    </div>
                                                    <div className="small text-muted">Dr. {ev.doctor}</div>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => setPage(p => p - 1)} disabled={!hasPrev}>
                    ‹ Previous
                </button>
                <button className="btn btn-outline-primary btn-sm"
                        onClick={() => setPage(0)} disabled={page === 0}>
                    Today
                </button>
                <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => setPage(p => p + 1)} disabled={!hasNext}>
                    Next ›
                </button>
            </div>
        </div>
    );
}

function toKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function formatDate(key) {
    return new Date(key + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric",
    });
}
function formatTime(startStr) {
    return new Date(startStr).toLocaleTimeString(undefined, {
        hour: "numeric", minute: "2-digit",
    });
}
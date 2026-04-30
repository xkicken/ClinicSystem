document.addEventListener('DOMContentLoaded', function () {
    const doctorEl = document.getElementById('selected_doctor');
    const slotsEl = document.getElementById('time_slots_available');

    let selected_doctor = null;
    let timeslots = [];

    if (doctorEl) {
        selected_doctor = JSON.parse(doctorEl.textContent);
    }

    if (slotsEl) {
        timeslots = JSON.parse(slotsEl.textContent || '[]');
    }

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        slotMinTime: '09:00:00',
        slotMaxTime: '17:00:00',
        allDaySlot: false,
        eventDisplay: 'block',
        eventOverlap: true,
        slotDuration: '00:10:00',
        height: "calc(100vh - 400px)",

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
        },

        eventClick: function (info) {

            document.getElementById("modalTitle").innerText = info.event.title;
            document.getElementById("modalTime").innerText =
                info.event.start.toLocaleString() + ' - ' + info.event.end.toLocaleString();

            document.getElementById("bookBtn").onclick = function () {

                let doctor = selected_doctor.id;
                console.log(doctor);

                window.location.href =
                    `/booking/?doctor=${doctor}&start=${info.event.start.toISOString()}&end=${info.event.end.toISOString()}`;
            };

            let modal = new bootstrap.Modal(document.getElementById('eventModal'));
            modal.show();
        },
        events: timeslots,
    });
    calendar.render();
});


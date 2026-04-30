document.addEventListener('DOMContentLoaded', function () {
    const selected_doctor = JSON.parse(document.getElementById('selected_doctor').textContent);
    const timeslots = JSON.parse(document.getElementById('time_slots_available').textContent);

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        slotMinTime: '09:00:00',
        slotMaxTime: '17:00:00',
        allDaySlot: false,
        eventDisplay: 'block',
        eventOverlap: false,
        slotDuration: '00:10:00',
        height: 'auto',

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

        events: timeslots
    });
    calendar.render();
});


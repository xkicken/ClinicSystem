document.addEventListener('DOMContentLoaded', function () {
    const timeslots = JSON.parse(document.getElementById('time_slots_available').textContent);
    console.log(timeslots);

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        slotMinTime: '09:00:00',
        slotMaxTime: '17:00:00',
        allDaySlot: false,
        eventDisplay: 'block',
        eventOverlap: false,
        slotDuration: '00:10:00',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },

        views: {
            dayGridMonth: {buttonText: 'Month'},
            timeGridWeek: {buttonText: 'Week'},
            timeGridDay: {buttonText: 'Day'},
            listWeek: {buttonText: 'List'}
        },

        eventClick: function (info) {
            let confirmBook = confirm(
                "Do you want to book this time slot?\n" +
                "Time: " + info.event.start.toLocaleString()
            );

            if (!confirmBook) return;

            let doctor = document.getElementById('doctorSelect').value;

            window.location.href = `/appointment/booking?doctor=${doctor}&start_date=${info.event.start.toLocaleString()}`;

        },

        events: timeslots
    });
    calendar.render();
});


document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',


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
            const eventId = info.event.id;

            window.location.href = `/booking/view/${eventId}/`;
        },
        events: appointment
    });
    calendar.render();
});

const appointment = JSON.parse(document.getElementById('patient_appointments').textContent);
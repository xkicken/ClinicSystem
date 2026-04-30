document.addEventListener('DOMContentLoaded', function () {
    const timeslots = JSON.parse(document.getElementById('time_slots_available').textContent);
    console.log(timeslots);
    
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',

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

        events: timeslots
    });
    calendar.render();
});
from django.core.management.base import BaseCommand
from appointment.models import Doctor, TimeSlot
from datetime import timedelta, time
from django.utils import timezone

# python manage.py generate_timeslots

class Command(BaseCommand):
    help = "Generate 15-minute TimeSlots"

    def handle(self, *args, **kwargs):

        doctors = Doctor.objects.all()

        start_date = timezone.now().date()

        days_ahead = 7

        start_hour = 9
        end_hour = 17

        break_hour = [12, 13]

        slot_minutes = 15

        created = 0

        for doctor in doctors:
            for day in range(days_ahead):

                slot_date = start_date + timedelta(days=day)

                for hour in range(start_hour, end_hour):
                    if hour in break_hour:
                        continue

                    for minute in range(0, 60, slot_minutes):

                        start_time = time(hour, minute)

                        # calculate end time safely
                        end_minute = minute + slot_minutes
                        end_hour_calc = hour

                        if end_minute >= 60:
                            end_minute -= 60
                            end_hour_calc += 1

                        end_time = time(end_hour_calc, end_minute)

                        # prevent duplicates
                        exists = TimeSlot.objects.filter(
                            doctor=doctor,
                            date=slot_date,
                            start_time=start_time
                        ).exists()

                        if exists:
                            continue

                        TimeSlot.objects.create(
                            doctor=doctor,
                            date=slot_date,
                            start_time=start_time,
                            end_time=end_time,
                        )

                        created += 1

        self.stdout.write(self.style.SUCCESS(
            f"15-min TimeSlots created: {created}"
        ))
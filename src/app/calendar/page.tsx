import Calendar from "~/components/Calendar";
import { db } from "~/server/db";

export default async function CalendarPage() {
  const events = await db.query.events
    .findMany({
      with: {
        organizer: true,
      },
    })
    .then((results) =>
      results.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        location: event.location,
        extendedProps: {
          organizerId: event.organizerId,
          organizer: event.organizer,
        },
      })),
    );

  return (
    <div className="mx-auto h-[calc(100dvh-4rem)] max-w-7xl px-4 py-8">
      <Calendar events={events} />
    </div>
  );
}

import { useRef, useCallback } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Swal from "sweetalert2";

import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createBulkSchedule 
} from "../../services/scheduleService";

export default function CalendarScheduler({ device, mode, events, reload }) {
  const calendarRef = useRef();

  const formatLocalDateTime = (date) => {
    if (!date) return "";

    const pad = (n) => String(n).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  /* ---------------- DROP CREATIVE ---------------- */

  const handleEventReceive = useCallback(
  async (info) => {
    const creativeId = info.event.extendedProps.creativeId;
    const creativeType = info.event.extendedProps.type;
    const baseDuration = info.event.extendedProps.duration || 10;

    const start = info.event.start || info.date; // ✅ CORRECT DROP TIME

    // ✅ auto calculate end
    const defaultEnd = new Date(start.getTime() + baseDuration * 1000);

    const { value } = await Swal.fire({
      title: "Schedule Creative",

      html: `
  <label>Start Time</label>
  <input id="start" type="datetime-local" class="swal2-input" readonly>

  <label>End Time</label>
  <input id="end" type="datetime-local" class="swal2-input">

  ${
    creativeType !== "video"
      ? `
  <label>Duration (seconds)</label>
  <input id="duration" type="number" class="swal2-input">
  `
      : ""
  }
`,

      didOpen: () => {
  setTimeout(() => {
    const startInput = document.getElementById("start");
    const endInput = document.getElementById("end");
    const durationInput = document.getElementById("duration");

    if (startInput) {
      startInput.value = formatLocalDateTime(start);
    }

    if (endInput) {
      endInput.value = formatLocalDateTime(defaultEnd);
    }

    if (durationInput) {
      durationInput.value = baseDuration;
    }
  }, 50);
},

      preConfirm: () => {
        const end = document.getElementById("end").value;
        const durationInput = document.getElementById("duration");

        if (!end) {
          Swal.showValidationMessage("End time required");
          return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // ❗ VALIDATION
        if (endDate <= startDate) {
          Swal.showValidationMessage("End must be after start");
          return;
        }

        return {
          end,
          duration:
  creativeType === "video"
    ? baseDuration
    : Number(durationInput?.value || baseDuration),
        };
      },
    });

    if (!value) {
      info.revert();
      return;
    }
info.event.remove();
    try {
      if (mode === "overwrite") {
  await createBulkSchedule({
    device_ids: [device.id],
    creative_id: creativeId,
    duration: value.duration,
    start_time: formatLocalDateTime(start),
    end_time: value.end,
    mode: "overwrite",
  });
} else {
  await createSchedule({
    device_id: device.id,
    office_id: device.office_id,
    creative_id: creativeId,
    start_time: formatLocalDateTime(start),
    end_time: value.end,
    duration: value.duration,
    mode: "playalong",
  });
}

      await reload();
      if (calendarRef.current) {
  calendarRef.current.getApi().refetchEvents();
}
    } catch {
      Swal.fire("Error", "Failed to create schedule", "error");
      info.revert();
    }
  },
  [device, mode, reload]
);

  /* ---------------- CLICK EVENT ---------------- */

  const handleEventClick = useCallback(
    async (info) => {
      const { event } = info;

      const res = await Swal.fire({
        title: event.title,

        html: `
      <p><strong>Start:</strong> ${event.start.toLocaleString()}</p>
      <p><strong>End:</strong> ${event.end.toLocaleString()}</p>
    `,

        showDenyButton: true,
        showCancelButton: true,

        confirmButtonText: "Delete",
        denyButtonText: "Edit",

        confirmButtonColor: "#dc3545",
        denyButtonColor: "#4e73df",
      });

      /* DELETE */

      if (res.isConfirmed) {

  const confirmDelete = await Swal.fire({
    title: "Delete Schedule?",
    text: "This scheduled content will be permanently removed.",
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",

    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d"
  });

  if (!confirmDelete.isConfirmed) return;

  await deleteSchedule(event.id);

  await Swal.fire({
    icon: "success",
    title: "Deleted",
    text: "Schedule removed successfully",
    timer: 1200,
    showConfirmButton: false
  });

  reload();

  return;
}

      /* EDIT */

      if (res.isDenied) {
        const { value, isConfirmed } = await Swal.fire({
          title: "Edit Schedule",

          html: `
      <label>Start Time</label>
      <input id="start" type="datetime-local" class="swal2-input"
      value="${formatLocalDateTime(event.start)}">

      <label>End Time</label>
      <input id="end" type="datetime-local" class="swal2-input"
      value="${formatLocalDateTime(event.end)}">

      <label>Duration (seconds)</label>
      <input id="duration" type="number" class="swal2-input"
      value="${event.extendedProps.duration || ""}">
    `,

          showCancelButton: true,

          confirmButtonText: "Update",
          cancelButtonText: "Cancel",

          confirmButtonColor: "#4e73df",
          cancelButtonColor: "#6c757d",

          preConfirm: () => {
            const start = document.getElementById("start").value;
            const end = document.getElementById("end").value;
            const duration = document.getElementById("duration").value;

            if (!start || !end) {
              Swal.showValidationMessage("Start and End required");
              return;
            }

            return { start, end, duration };
          },
        });

        /* If user clicked cancel */

        if (!isConfirmed || !value) return;

        await updateSchedule(event.id, {
          start_time: value.start,
          end_time: value.end,
          duration: value.duration ? Number(value.duration) : null,
        });

        reload();
      }
    },
    [reload],
  );

  /* ---------------- DRAG / RESIZE EVENT ---------------- */

  const handleEventChange = useCallback(
  async (info) => {
    const { event } = info;

    if (!event.id) return;

    try {
      await updateSchedule(event.id, {
        start_time: formatLocalDateTime(event.start),
        end_time: formatLocalDateTime(event.end),
        duration: event.extendedProps.duration,
      });

      reload();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update schedule", "error");
    }
  },
  [reload]
);

  /* ---------------- EVENT UI ---------------- */

  const renderEventContent = (eventInfo) => {
    const start = eventInfo.event.start?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="calendar-event">
        <div className="event-title">{eventInfo.event.title}</div>

        <div className="event-time">{start}</div>
      </div>
    );
  };

  return (
    <div className="calendar-wrapper card shadow-sm border-0">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        droppable={true}
        selectable={true}
        events={events}
        eventReceive={handleEventReceive}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
        eventContent={renderEventContent}
        eventDurationEditable={true}
eventStartEditable={true}
eventResizableFromStart={true}
defaultTimedEventDuration="00:00:10"
forceEventDuration={true}
        nowIndicator={true}
        height="75vh"
      />

      <style>{`

      .calendar-wrapper{
        border-radius:16px;
        padding:10px;
      }

      .fc-toolbar-title{
        font-weight:600;
        font-size:1.2rem;
      }

      .fc-button{
        border-radius:8px!important;
        padding:5px 10px!important;
      }

      .calendar-event{
        padding:3px 4px;
        overflow:hidden;
      }

      .event-title{
        font-weight:600;
        font-size:.8rem;
        line-height:1.2;
      }

      .event-time{
        font-size:.7rem;
        opacity:.85;
      }

      .fc-event{
        border-radius:6px!important;
      }

      `}</style>
    </div>
  );
}

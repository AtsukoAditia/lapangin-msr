"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  time: string;
  label: string;
  available: boolean;
};

type Props = {
  courtId: string;
  sportSlug: string;
  venueSlug: string;
  courtSlug: string;
  openTime: string;
  closeTime: string;
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function generateSlots(openTime: string, closeTime: string): Slot[] {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const slots: Slot[] = [];
  for (let m = start; m + 60 <= end; m += 60) {
    const from = minutesToTime(m);
    const to = minutesToTime(m + 60);
    slots.push({
      time: `${from}-${to}`,
      label: `${from} – ${to}`,
      available: true,
    });
  }
  return slots;
}

function getToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getNext7Days(): { date: string; label: string; dayName: string }[] {
  const days: { date: string; label: string; dayName: string }[] = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      label: `${dd}/${mm}`,
      dayName: dayNames[d.getDay()],
    });
  }
  return days;
}

export default function SlotSelector({
  courtId,
  sportSlug,
  venueSlug,
  courtSlug,
  openTime,
  closeTime,
}: Props) {
  const router = useRouter();
  const dates = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(dates[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slots = generateSlots(openTime, closeTime);

  function handleContinue() {
    if (!selectedDate || !selectedSlot) return;
    const [startTime, endTime] = selectedSlot.split("-");
    const params = new URLSearchParams({
      courtId,
      date: selectedDate,
      startTime,
      endTime,
      sport: sportSlug,
      venue: venueSlug,
      court: courtSlug,
    });
    router.push(`/booking/form?${params.toString()}`);
  }

  return (
    <div>
      {/* Date pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => {
              setSelectedDate(d.date);
              setSelectedSlot(null);
            }}
            className={`flex min-w-[64px] flex-col items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
              selectedDate === d.date
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="text-xs">{d.dayName}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => setSelectedSlot(slot.time)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              !slot.available
                ? "cursor-not-allowed bg-slate-100 text-slate-400 line-through"
                : selectedSlot === slot.time
                  ? "bg-emerald-600 text-white shadow"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-400"
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selectedSlot}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
          selectedSlot
            ? "bg-emerald-600 text-white shadow hover:bg-emerald-700"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        {selectedSlot
          ? `Lanjut Booking — ${selectedSlot.replace("-", " – ")}`
          : "Pilih jam terlebih dahulu"}
      </button>
    </div>
  );
}
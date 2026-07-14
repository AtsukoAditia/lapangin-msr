"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeAvailability, type TimeSlot } from "@/hooks/useRealtimeAvailability";

type Slot = TimeSlot;

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

function generateFallbackSlots(openTime: string, closeTime: string): Slot[] {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const slots: Slot[] = [];

  for (let m = start; m + 60 <= end; m += 60) {
    slots.push({
      startTime: minutesToTime(m),
      endTime: minutesToTime(m + 60),
      isAvailable: true,
    });
  }

  return slots;
}

function getNext7Days(): { date: string; label: string; dayName: string; isToday: boolean }[] {
  const days: { date: string; label: string; dayName: string; isToday: boolean }[] = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    days.push({
      date: dateStr,
      label: `${dd}/${mm}`,
      dayName: dayNames[d.getDay()],
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
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
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [slots, setSlots] = useState<Slot[]>(() =>
    generateFallbackSlots(openTime, closeTime)
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const { slots: realtimeSlots, isConnected } = useRealtimeAvailability({
    courtId,
    date: selectedDate,
    openTime,
    closeTime,
    slotDurationMinutes: 60,
  });

  // Clear selected slots when date changes
  const [prevDate, setPrevDate] = useState(selectedDate);
  if (prevDate !== selectedDate) {
    setPrevDate(selectedDate);
    setSelectedSlots([]);
    setSlotError(null);
  }

  // Sync real-time slots into local state
  useEffect(() => {
    if (realtimeSlots.length > 0) {
      setSlots(realtimeSlots);
      setLoadingSlots(false);
    }
  }, [realtimeSlots]);

  // Fallback: if SSE never delivers within 3s, fall back to REST
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (realtimeSlots.length > 0 || !active) return;
      setLoadingSlots(true);
      try {
        const params = new URLSearchParams({
          courtId,
          date: selectedDate,
          openTime,
          closeTime,
          slotDurationMinutes: "60",
        });
        const res = await fetch(`/api/availability?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat slot tersedia.");
        if (!active) return;
        const nextSlots = Array.isArray(data.data) ? data.data : [];
        setSlots(nextSlots);
      } catch (error) {
        if (!active) return;
        setSlots([]);
        setSlotError(error instanceof Error ? error.message : "Gagal memuat slot tersedia.");
      } finally {
        if (active) setLoadingSlots(false);
      }
    }, 3_000);
    return () => { active = false; clearTimeout(timer); };
  }, [courtId, selectedDate, openTime, closeTime, realtimeSlots.length]);


  function handleSlotClick(slot: Slot) {
    const isSelected = selectedSlots.some(
      (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
    );

    if (isSelected) {
      // Remove slot
      setSelectedSlots(selectedSlots.filter(
        (s) => !(s.startTime === slot.startTime && s.endTime === slot.endTime)
      ));
    } else {
      // Add slot (validate consecutive)
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot]);
      } else {
        // Check if slot is consecutive with existing selections
        const sortedSlots = [...selectedSlots].sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];

        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        const firstStart = timeToMinutes(firstSlot.startTime);
        const lastEnd = timeToMinutes(lastSlot.endTime);

        // Check if slot is adjacent to first or last
        if (slotEnd === firstStart || slotStart === lastEnd) {
          setSelectedSlots([...selectedSlots, slot]);
        } else {
          // Not consecutive, replace selection
          setSelectedSlots([slot]);
        }
      }
    }
  }

  function isSlotDisabled(slot: Slot): boolean {
    if (!slot.isAvailable) return true;
    if (loadingSlots) return true;
    
    // Check if slot is in the past for today
    const selectedDateInfo = dates.find((d) => d.date === selectedDate);
    if (selectedDateInfo?.isToday) {
      const currentMinutes = getCurrentTimeMinutes();
      const slotStartMinutes = timeToMinutes(slot.startTime);
      if (slotStartMinutes <= currentMinutes) {
        return true;
      }
    }
    
    return false;
  }

  function handleContinue() {
    if (selectedSlots.length === 0) return;

    // Sort slots by start time
    const sortedSlots = [...selectedSlots].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    const params = new URLSearchParams({
      courtId,
      date: selectedDate,
      startTime: firstSlot.startTime,
      endTime: lastSlot.endTime,
      sport: sportSlug,
      venue: venueSlug,
      court: courtSlug,
      duration: String(sortedSlots.length),
    });
    router.push(`/booking/form?${params.toString()}`);
  }

  // Calculate total duration
  const totalDuration = selectedSlots.length;
  const sortedSelectedSlots = [...selectedSlots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const timeRange =
    sortedSelectedSlots.length > 0
      ? `${sortedSelectedSlots[0].startTime} - ${sortedSelectedSlots[sortedSelectedSlots.length - 1].endTime}`
      : "";

  return (
    <div>
      {/* Date pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => {
              setSelectedDate(d.date);
            }}
            className={`flex min-w-[64px] flex-col items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
              selectedDate === d.date
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="text-xs">{d.dayName}</span>
            <span>{d.label}</span>
            {d.isToday && (
              <span className="text-[10px] opacity-75">Hari ini</span>
            )}
          </button>
        ))}
      </div>

      {slotError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {slotError}
        </div>
      )}

      {/* Live indicator */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
        <span className="text-xs text-slate-500">
          {isConnected ? "Live — slot diperbarui otomatis" : "Menghubungkan..."}
        </span>
      </div>

      {/* Selection info */}
      {selectedSlots.length > 0 && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {totalDuration} jam dipilih
              </p>
              <p className="text-xs text-emerald-700">{timeRange}</p>
            </div>
            <button
              onClick={() => setSelectedSlots([])}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}

      {/* Time slots grid */}
      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const slotKey = `${slot.startTime}-${slot.endTime}`;
          const isSelected = selectedSlots.some(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
          );
          const isDisabled = isSlotDisabled(slot);
          const label = `${slot.startTime} – ${slot.endTime}`;

          return (
            <button
              key={slotKey}
              disabled={isDisabled}
              onClick={() => handleSlotClick(slot)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isDisabled
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 line-through"
                  : isSelected
                    ? "bg-emerald-600 text-white shadow ring-2 ring-emerald-600 ring-offset-2"
                    : "border border-slate-200 bg-white text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loadingSlots && (
        <p className="mb-4 text-center text-sm text-slate-500">
          Memuat slot tersedia...
        </p>
      )}

      {/* Help text */}
      <p className="mb-4 text-xs text-slate-500 text-center">
        💡 Pilih beberapa jam berurutan untuk booking lebih lama
      </p>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={selectedSlots.length === 0 || loadingSlots}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
          selectedSlots.length > 0 && !loadingSlots
            ? "bg-emerald-600 text-white shadow hover:bg-emerald-700"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        {selectedSlots.length > 0
          ? `Lanjut Booking — ${totalDuration} jam (${timeRange})`
          : "Pilih jam terlebih dahulu"}
      </button>
    </div>
  );
}
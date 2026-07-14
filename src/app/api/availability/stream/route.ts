import { NextRequest } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { AvailabilityService } from "@/lib/services/availability-service";
import { BookingService } from "@/lib/services/booking-service";

export const runtime = "nodejs";

/**
 * SSE endpoint that streams availability updates.
 * Accepts query params: courtId, date, openTime, closeTime, slotDurationMinutes
 * Polls DB every 5 seconds, sends full slot list when changes detected.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");
  const openTime = searchParams.get("openTime") ?? undefined;
  const closeTime = searchParams.get("closeTime") ?? undefined;
  const rawDuration = searchParams.get("slotDurationMinutes");
  const slotDurationMinutes = rawDuration ? Number(rawDuration) : undefined;

  if (!courtId || !date) {
    return new Response(
      JSON.stringify({ error: "Parameter courtId dan date wajib diisi." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // Send initial availability snapshot
      const adapter = getDatabaseAdapter();
      const bookingService = new BookingService(adapter);
      const service = new AvailabilityService(adapter);

      async function fetchSlots() {
        await bookingService.expireBookings().catch(() => {});
        return service.getAvailableSlots({
          courtId: courtId!,
          date: date!,
          openTime,
          closeTime,
          slotDurationMinutes,
        });
      }

      let previousSlots = await fetchSlots();
      sendEvent({ type: "snapshot", slots: previousSlots, timestamp: Date.now() });

      // Poll every 5 seconds
      const interval = setInterval(async () => {
        try {
          const currentSlots = await fetchSlots();
          const prevJson = JSON.stringify(previousSlots);
          const currJson = JSON.stringify(currentSlots);

          if (prevJson !== currJson) {
            sendEvent({
              type: "update",
              slots: currentSlots,
              timestamp: Date.now(),
            });
            previousSlots = currentSlots;
          } else {
            // Heartbeat to keep connection alive
            sendEvent({ type: "heartbeat", timestamp: Date.now() });
          }
        } catch {
          sendEvent({ type: "error", message: "Gagal mengambil data ketersediaan." });
        }
      }, 5_000);

      // Close connection if client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface UseRealtimeAvailabilityOptions {
  courtId: string;
  date: string;
  openTime?: string;
  closeTime?: string;
  slotDurationMinutes?: number;
}

interface UseRealtimeAvailabilityReturn {
  slots: TimeSlot[];
  isConnected: boolean;
  lastUpdate: number | null;
}

/**
 * Hook that connects to /api/availability/stream via SSE.
 * Auto-reconnects on disconnect (exponential backoff, max 30s).
 * Returns { slots, isConnected, lastUpdate }.
 */
export function useRealtimeAvailability(
  opts: UseRealtimeAvailabilityOptions
): UseRealtimeAvailabilityReturn {
  const { courtId, date, openTime, closeTime, slotDurationMinutes } = opts;
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const reconnectRef = useRef(1_000);
  const abortRef = useRef<AbortController | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;
    abortRef.current?.abort();

    const params = new URLSearchParams({ courtId, date });
    if (openTime) params.set("openTime", openTime);
    if (closeTime) params.set("closeTime", closeTime);
    if (slotDurationMinutes) params.set("slotDurationMinutes", String(slotDurationMinutes));

    const url = `/api/availability/stream?${params.toString()}`;
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        setIsConnected(true);
        reconnectRef.current = 1_000;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.type === "snapshot" || payload.type === "update") {
                setSlots(payload.slots);
                setLastUpdate(payload.timestamp);
              }
            } catch {
              // skip malformed SSE
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      } finally {
        setIsConnected(false);
        if (!unmountedRef.current) {
          const delay = reconnectRef.current;
          reconnectRef.current = Math.min(delay * 2, 30_000);
          setTimeout(connect, delay);
        }
      }
    })();
  }, [courtId, date, openTime, closeTime, slotDurationMinutes]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      abortRef.current?.abort();
    };
  }, [connect]);

  return { slots, isConnected, lastUpdate };
}

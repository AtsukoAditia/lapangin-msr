import { z } from "zod";

export const createBookingSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().email().optional().or(z.literal("")),
  venueId: z.string().min(1),
  courtId: z.string().min(1),
  sportId: z.string().min(1),
  bookingDate: z.string().min(10),
  startTime: z.string().min(5),
  endTime: z.string().min(5),
  durationMinutes: z.number().min(30),
  totalPrice: z.number().min(0),
  notes: z.string().optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

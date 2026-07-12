import { getDatabaseAdapter } from "@/lib/adapters";
import type {
  NotificationPayload,
  NotificationLog,
  Booking,
  NotificationChannel,
  NotificationType,
} from "@/lib/types/domain";
import { getNotificationTemplate } from "@/lib/notification-templates";
import { sendMessage, formatPhoneNumber, isWhatsAppReady } from "@/lib/whatsapp/client";

export interface SendNotificationInput {
  type: NotificationType;
  channel: NotificationChannel;
  booking: Booking;
  recipient: string;
}

/**
 * Build and send a notification, persisting to the notification_logs table.
 * In MVP, all notifications are logged but not actually delivered via email/SMS.
 * This service acts as the foundation for future delivery integrations.
 */
export async function sendNotification(
  input: SendNotificationInput,
): Promise<NotificationLog> {
  const adapter = getDatabaseAdapter();

  const template = getNotificationTemplate(input.type, {
    bookingCode: input.booking.bookingCode,
    customerName: input.booking.customerName,
    bookingDate: input.booking.bookingDate,
    startTime: input.booking.startTime,
    endTime: input.booking.endTime,
    totalPrice: input.booking.totalPrice,
    paymentStatus: input.booking.paymentStatus,
  });

  const payload: NotificationPayload = {
    type: input.type,
    channel: input.channel,
    recipient: input.recipient,
    subject: template.subject,
    message: template.message,
    bookingId: input.booking.id,
    bookingCode: input.booking.bookingCode,
  };

  try {
    // Try real WhatsApp delivery if channel is whatsapp and service is ready
    if (input.channel === "whatsapp") {
      const ready = await isWhatsAppReady();
      if (ready) {
        const phone = formatPhoneNumber(input.recipient);
        const result = await sendMessage(phone, template.message);
        const status = result.success ? "sent" : "failed";
        const log = await adapter.createNotificationLog(
          payload,
          status,
          result.error,
        );
        console.log(
          `[WhatsApp] ${input.type} to ${phone} — ${result.success ? "sent" : "failed"}: ${result.error || log.id}`,
        );
        return log;
      }
    }

    // Fallback: log as "sent" (no actual delivery)
    const log = await adapter.createNotificationLog(payload, "sent");
    console.log(
      `[Notification] ${input.type} via ${input.channel} to ${input.recipient} — ${log.id}`,
    );
    return log;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const log = await adapter.createNotificationLog(
      payload,
      "failed",
      errorMessage,
    );
    console.error(
      `[Notification] FAILED ${input.type} via ${input.channel}: ${errorMessage}`,
    );
    return log;
  }
}

/**
 * Send booking_created notification to customer (after booking is made)
 */
export async function sendBookingCreated(
  booking: Booking,
): Promise<NotificationLog> {
  const recipient = booking.customerEmail || booking.customerPhone;
  const channel: NotificationChannel = booking.customerEmail
    ? "email"
    : "whatsapp";

  return sendNotification({
    type: "booking_created",
    channel,
    booking,
    recipient,
  });
}

/**
 * Send booking_confirmed notification to customer
 */
export async function sendBookingConfirmation(
  booking: Booking,
): Promise<NotificationLog> {
  const recipient = booking.customerEmail || booking.customerPhone;
  const channel: NotificationChannel = booking.customerEmail
    ? "email"
    : "whatsapp";

  return sendNotification({
    type: "booking_confirmed",
    channel,
    booking,
    recipient,
  });
}

/**
 * Send payment_confirmed notification to customer
 */
export async function sendPaymentConfirmation(
  booking: Booking,
): Promise<NotificationLog> {
  const recipient = booking.customerEmail || booking.customerPhone;
  const channel: NotificationChannel = booking.customerEmail
    ? "email"
    : "whatsapp";

  return sendNotification({
    type: "payment_confirmed",
    channel,
    booking,
    recipient,
  });
}

/**
 * Send booking_rejected notification to customer
 */
export async function sendBookingRejection(
  booking: Booking,
): Promise<NotificationLog> {
  const recipient = booking.customerEmail || booking.customerPhone;
  const channel: NotificationChannel = booking.customerEmail
    ? "email"
    : "whatsapp";

  return sendNotification({
    type: "booking_rejected",
    channel,
    booking,
    recipient,
  });
}

/**
 * Send booking_cancelled notification to customer
 */
export async function sendBookingCancellation(
  booking: Booking,
): Promise<NotificationLog> {
  const recipient = booking.customerEmail || booking.customerPhone;
  const channel: NotificationChannel = booking.customerEmail
    ? "email"
    : "whatsapp";

  return sendNotification({
    type: "booking_cancelled",
    channel,
    booking,
    recipient,
  });
}

/**
 * Send admin alert for new booking
 */
export async function sendAdminNewBookingAlert(
  booking: Booking,
): Promise<NotificationLog> {
  return sendNotification({
    type: "admin_new_booking",
    channel: "in_app",
    booking,
    recipient: "admin",
  });
}

/**
 * Send admin alert for payment proof submission
 */
export async function sendAdminPaymentProofAlert(
  booking: Booking,
): Promise<NotificationLog> {
  return sendNotification({
    type: "admin_payment_proof",
    channel: "in_app",
    booking,
    recipient: "admin",
  });
}

/**
 * Get all notification logs, optionally filtered by booking
 */
export async function getNotificationLogs(
  bookingId?: string,
): Promise<NotificationLog[]> {
  const adapter = getDatabaseAdapter();
  return adapter.getNotificationLogs(bookingId);
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  id: string,
): Promise<NotificationLog> {
  const adapter = getDatabaseAdapter();
  return adapter.markNotificationRead(id);
}
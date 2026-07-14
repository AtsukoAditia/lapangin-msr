import * as Sentry from "@sentry/nextjs";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    }
    Sentry.captureException(error);
  });
}

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE ?? '0.0'
  ),
  debug: false,
});

// Add request error instrumentation
export function onRequestError(error: Error, request: any, response: any) {
  Sentry.captureRequestError(error, request, response);
} 
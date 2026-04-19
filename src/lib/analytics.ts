const ENDPOINT = '/api/analytics';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return '';
  sessionId = sessionStorage.getItem('tink_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('tink_session_id', sessionId);
  }
  return sessionId;
}

export function trackEvent(
  eventType: string,
  data?: {
    productId?: string;
    variant?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (typeof window === 'undefined') return;

  const payload = {
    event_type: eventType,
    product_id: data?.productId,
    variant: data?.variant,
    session_id: getSessionId(),
    source: data?.source,
    referrer: document.referrer || null,
    metadata: data?.metadata || {},
  };

  // Fire and forget — don't block UI
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

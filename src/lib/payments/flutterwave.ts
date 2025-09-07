const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY as string;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;

if (!FLW_SECRET_KEY) {
  // Do not throw at import time in case of local tools, but functions will error if used.
}

export interface FlutterwaveInitPayload {
  amount: number;
  currency: string; // e.g., 'GHS'
  email: string;
  name?: string | null;
  txRef: string;
  redirectUrl?: string;
  meta?: Record<string, any>;
}

export async function createFlutterwavePaymentLink(payload: FlutterwaveInitPayload): Promise<string> {
  if (!FLW_SECRET_KEY) throw new Error('Missing FLW_SECRET_KEY');
  const body = {
    tx_ref: payload.txRef,
    amount: payload.amount,
    currency: payload.currency,
    redirect_url: payload.redirectUrl || `${NEXT_PUBLIC_APP_URL}/api/payments/verify`,
    customer: {
      email: payload.email,
      name: payload.name || undefined,
    },
    meta: payload.meta || {},
  };

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || json.status !== 'success' || !json.data?.link) {
    throw new Error(`Flutterwave init error: ${json?.message || res.statusText}`);
  }
  return json.data.link as string;
}

export async function verifyFlutterwaveTransaction(transactionId: string): Promise<any> {
  if (!FLW_SECRET_KEY) throw new Error('Missing FLW_SECRET_KEY');
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      'Authorization': `Bearer ${FLW_SECRET_KEY}`,
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(`Flutterwave verify error: ${json?.message || res.statusText}`);
  }
  return json.data;
}


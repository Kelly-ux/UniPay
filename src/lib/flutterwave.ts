import type { NextRequest } from 'next/server';

interface CreateCheckoutParams {
  amount: number;
  currency: string; // e.g. 'GHS'
  txRef: string;
  customer: { email: string; name?: string };
  redirectUrl: string;
  meta?: Record<string, any>;
  paymentOptions?: string; // e.g. 'card,mobilemoneyghana,banktransfer'
  customizations?: { title?: string; logo?: string; description?: string };
}

export interface CreateCheckoutResponse {
  link: string;
}

export async function createFlutterwaveCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResponse> {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error('Missing FLW_SECRET_KEY');

  const payload: any = {
    tx_ref: params.txRef,
    amount: Math.round(params.amount * 100) / 100,
    currency: params.currency,
    redirect_url: params.redirectUrl,
    customer: params.customer,
    meta: params.meta || {},
  };
  if (params.paymentOptions) payload.payment_options = params.paymentOptions;
  const title = process.env.BUSINESS_NAME || params.customizations?.title;
  const logo = process.env.BUSINESS_LOGO_URL || params.customizations?.logo;
  const description = params.customizations?.description;
  if (title || logo || description) {
    payload.customizations = { title, logo, description };
  }

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave create payment failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  const link = json?.data?.link;
  if (!link) throw new Error('Flutterwave response missing data.link');
  return { link };
}

export async function verifyFlutterwaveTransaction(transactionId: number | string) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error('Missing FLW_SECRET_KEY');
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave verify failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function computeSurchargedAmount(baseAmount: number): { totalAmount: number; surchargeAmount: number } {
  const percent = Number(process.env.PAYMENT_SURCHARGE_PERCENT || '0');
  const flat = Number(process.env.PAYMENT_SURCHARGE_FLAT || '0');
  const surchargeAmount = Math.round((baseAmount * (percent / 100) + flat) * 100) / 100;
  const totalAmount = Math.round((baseAmount + surchargeAmount) * 100) / 100;
  return { totalAmount, surchargeAmount };
}


'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get('status') || 'pending';
  const txRef = params.get('tx_ref') || params.get('txref') || '';

  const isSuccess = status.toLowerCase() === 'successful' || status.toLowerCase() === 'success';
  const isCancelled = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'failed';

  return (
    <div className="py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Payment {isSuccess ? 'Successful' : isCancelled ? 'Cancelled/Failed' : 'Pending'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {txRef && <div className="text-sm text-muted-foreground">Reference: {txRef}</div>}
          <div className="text-sm">We will update your status as soon as the payment is confirmed.</div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => router.push('/payment-history')}>Go to Payment History</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


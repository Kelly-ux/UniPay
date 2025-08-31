'use client';

import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface ProfileRequest {
  id: string;
  email?: string | null;
  name: string | null;
  student_id: string | null;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, student_id')
          .eq('pending_admin', true);
        if (error) throw error;
        setRequests((data || []).map((r: any) => ({ id: r.id, name: r.name, student_id: r.student_id })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('profiles').update({ is_admin: true, pending_admin: false }).eq('id', id);
    // Email notify the target user (if we can find their email) and log the event
    const { data: userRow } = await supabase.from('profiles').select('name').eq('id', id).maybeSingle();
    await fetch('/api/admin/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [],
        subject: 'Admin Access Approved',
        html: `<p>Your admin access request has been approved.</p>`,
      }),
    }).catch(() => {});
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeny = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('profiles').update({ pending_admin: false }).eq('id', id);
    await fetch('/api/admin/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [],
        subject: 'Admin Access Denied',
        html: `<p>Your admin access request has been denied.</p>`,
      }),
    }).catch(() => {});
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <div className="font-medium">{r.name || r.id}</div>
                    {r.student_id && <div className="text-sm text-muted-foreground">Student ID: {r.student_id}</div>}
                  </div>
                  <div className="space-x-2">
                    <Button variant="default" onClick={() => handleApprove(r.id)}>Approve</Button>
                    <Button variant="outline" onClick={() => handleDeny(r.id)}>Deny</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AuthGuard>
  );
}


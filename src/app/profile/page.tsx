'use client';

import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from('profiles').select('name, student_id').eq('id', user.id).single();
      if (data) {
        setName(data.name || '');
        setStudentId(data.student_id || '');
      }
    };
    load();
  }, [user?.id]);

  const onSave = async () => {
    if (!user) return;
    if (!studentId.trim()) {
      toast({ title: 'Student ID required', description: 'Please enter your Student ID.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({ name: name || null, student_id: studentId })
        .eq('id', user.id);
      if (error) throw error;
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message || 'Could not update profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['student','admin']}>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="UENR12345678" />
            </div>
            <Button onClick={onSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}


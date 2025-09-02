'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { useDues } from '@/contexts/dues-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface ProfileMap { [userId: string]: { name?: string | null; email?: string | null; student_id?: string | null } }

export default function AdminPaymentsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="py-8">
        <PaymentsContent />
      </div>
    </AuthGuard>
  );
}

function PaymentsContent() {
  const { user } = useAuth();
  const { dues, studentPayments } = useDues();

  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [dueFilter, setDueFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [profilesById, setProfilesById] = useState<ProfileMap>({});

  // Build helper maps
  const dueById = useMemo(() => {
    const map: Record<string, any> = {};
    dues.forEach(d => { map[d.id] = d; });
    return map;
  }, [dues]);

  const uniqueAuthIds = useMemo(() => {
    const set = new Set<string>();
    studentPayments.forEach(p => set.add(p.studentId));
    return Array.from(set);
  }, [studentPayments]);

  // Fetch profile names/emails for display (admin only)
  useEffect(() => {
    const run = async () => {
      if (!user || user.role !== 'admin' || uniqueAuthIds.length === 0) return;
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from('profiles')
        .select('id,name,student_id')
        .in('id', uniqueAuthIds as string[]);
      const map: ProfileMap = {};
      (data || []).forEach((row: any) => {
        map[row.id] = { name: row.name, student_id: row.student_id };
      });
      // Attempt to get auth emails via auth schema is typically not allowed via RLS; we keep name/student_id only
      setProfilesById(map);
    };
    run();
  }, [user?.id, user?.role, uniqueAuthIds.join(',')]);

  const filtered = useMemo(() => {
    return studentPayments.filter(p => {
      const due = dueById[p.dueId];
      if (!due) return false;
      if (schoolFilter && due.school !== schoolFilter) return false;
      if (departmentFilter && due.department !== departmentFilter) return false;
      if (dueFilter && due.id !== dueFilter) return false;
      if (fromDate && p.paymentDate < fromDate) return false;
      if (toDate && p.paymentDate > toDate) return false;
      return true;
    });
  }, [studentPayments, dueById, schoolFilter, departmentFilter, dueFilter, fromDate, toDate]);

  const schools = useMemo(() => Array.from(new Set(dues.map(d => d.school))), [dues]);
  const departments = useMemo(() => {
    const set = new Set<string>();
    dues
      .filter(d => !schoolFilter || d.school === schoolFilter)
      .forEach(d => set.add(d.department));
    return Array.from(set);
  }, [dues, schoolFilter]);
  const duesForSelect = useMemo(() => dues
    .filter(d => (!schoolFilter || d.school === schoolFilter) && (!departmentFilter || d.department === departmentFilter))
    .map(d => ({ id: d.id, label: `${d.description} (${d.school}/${d.department})` })), [dues, schoolFilter, departmentFilter]);

  const downloadCsv = () => {
    const rows = [
      ['Payment Date', 'Student Name', 'Student ID', 'Due Description', 'School', 'Department', 'Amount'],
      ...filtered.map(p => {
        const due = dueById[p.dueId];
        const profile = profilesById[p.studentId] || {};
        return [
          p.paymentDate,
          (profile.name || ''),
          (profile.student_id || ''),
          (due?.description || ''),
          (due?.school || ''),
          (due?.department || ''),
          (due?.amount != null ? String(due.amount) : ''),
        ];
      })
    ];
    const csv = rows.map(r => r.map(field => {
      const v = String(field ?? '');
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger><SelectValue placeholder="School" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {schools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={dueFilter} onValueChange={setDueFilter}>
              <SelectTrigger><SelectValue placeholder="Due" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {duesForSelect.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} placeholder="From" />
          </div>
          <div>
            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} placeholder="To" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={downloadCsv}>Export CSV</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Student ID</th>
                <th className="py-2 pr-4">School</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const due = dueById[p.dueId];
                const prof = profilesById[p.studentId] || {};
                return (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-4">{p.paymentDate}</td>
                    <td className="py-2 pr-4">{prof.name || p.studentId}</td>
                    <td className="py-2 pr-4">{prof.student_id || ''}</td>
                    <td className="py-2 pr-4">{due?.school}</td>
                    <td className="py-2 pr-4">{due?.department}</td>
                    <td className="py-2 pr-4">{due?.description}</td>
                    <td className="py-2 pr-4">{due?.amount != null ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(due.amount) : ''}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">No payments found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


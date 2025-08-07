
'use client';

import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, ListChecks } from 'lucide-react';
import Link from 'next/link';

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Admin Panel
      </h1>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, Admin!</CardTitle>
          <CardDescription>Manage university dues and student payments from here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/add-due" passHref>
            <Card className="hover:shadow-primary/20 transition-shadow cursor-pointer h-full flex flex-col hover:border-primary">
              <CardHeader className="flex-grow">
                <FilePlus className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Add New Due</CardTitle>
                <CardDescription>Create and assign new payment obligations for students.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Go to Add Due</Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/" passHref> {/* Link to main dues dashboard */}
             <Card className="hover:shadow-primary/20 transition-shadow cursor-pointer h-full flex flex-col hover:border-primary">
              <CardHeader className="flex-grow">
                <ListChecks className="h-10 w-10 text-primary mb-2" />
                <CardTitle>View All Dues</CardTitle>
                <CardDescription>Monitor all dues, filter by status, department, etc.</CardDescription>
              </CardHeader>
               <CardContent>
                <Button className="w-full" variant="outline">Go to Dues Dashboard</Button>
              </CardContent>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="py-8"> {/* Added padding to match other pages */}
        <AdminDashboard />
      </div>
    </AuthGuard>
  );
}

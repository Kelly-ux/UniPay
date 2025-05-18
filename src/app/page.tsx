
"use client";

import React, { useState, useMemo } from 'react';
import { DueFilters } from '@/components/due-filters';
import { DueCard } from '@/components/due-card';
import type { Due } from '@/lib/mock-data';
import { mockDues, uniqueSchools, uniqueDepartments, dueStatuses } from '@/lib/mock-data';
import { Frown } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

function DuesDashboardContent() {
  const [filters, setFilters] = useState({
    school: 'all',
    department: 'all',
    status: 'all',
    searchTerm: '',
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const filteredDues = useMemo(() => {
    return mockDues.filter((due: Due) => {
      const schoolMatch = filters.school === 'all' || due.school === filters.school;
      const departmentMatch = filters.department === 'all' || due.department === filters.department;
      const statusMatch = filters.status === 'all' || due.status === filters.status;
      const searchTermMatch = filters.searchTerm === '' || 
                              due.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                              due.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return schoolMatch && departmentMatch && statusMatch && searchTermMatch;
    });
  }, [filters]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dues Dashboard
      </h1>
      
      <DueFilters
        schools={uniqueSchools}
        departments={uniqueDepartments}
        statuses={dueStatuses}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {filteredDues.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDues.map((due) => (
            <DueCard key={due.id} due={due} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Dues Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DuesDashboardPage() {
  return (
    <AuthGuard allowedRoles={['student', 'admin']}>
      <DuesDashboardContent />
    </AuthGuard>
  );
}

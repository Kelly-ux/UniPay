
"use client";

import React, { useState, useMemo } from 'react';
import { DueFilters } from '@/components/due-filters';
import { DueCard } from '@/components/due-card';
import type { Due } from '@/lib/mock-data';
import { uniqueSchools, uniqueDepartments, dueStatuses } from '@/lib/mock-data';
import { Frown } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { useDues } from '@/contexts/dues-context'; // Import useDues

function DuesDashboardContent() {
  const { dues: allDues } = useDues(); // Use dues from context
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
    return allDues.filter((due: Due) => {
      const schoolMatch = filters.school === 'all' || due.school === filters.school;
      const departmentMatch = filters.department === 'all' || due.department === filters.department;
      const statusMatch = filters.status === 'all' || due.status === filters.status;
      const searchTermMatch = filters.searchTerm === '' || 
                              due.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                              due.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return schoolMatch && departmentMatch && statusMatch && searchTermMatch;
    });
  }, [allDues, filters]);

  // Dynamically generate unique schools and departments from context dues
  const currentUniqueSchools = useMemo(() => Array.from(new Set(allDues.map(due => due.school))).sort(), [allDues]);
  const currentUniqueDepartments = useMemo(() => Array.from(new Set(allDues.map(due => due.department))).sort(), [allDues]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dues Dashboard
      </h1>
      
      <DueFilters
        schools={currentUniqueSchools}
        departments={currentUniqueDepartments}
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
            Try adjusting your filters or search term. Admins can add new dues.
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

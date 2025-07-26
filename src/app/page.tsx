
"use client";

import React, { useState, useMemo } from 'react';
import { DueFilters } from '@/components/due-filters';
import { DueCard } from '@/components/due-card';
import type { Due } from '@/lib/types';
import { uniqueSchools, uniqueDepartments, dueStatuses } from '@/lib/mock-data';
import { Frown } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { useDues } from '@/contexts/dues-context';
import { useAuth } from '@/contexts/auth-context'; // To get user for filtering if needed

function DuesDashboardContent() {
  const { user } = useAuth();
  const { dues: allDueDefinitions } = useDues(); // These are Due Definitions
  const [filters, setFilters] = useState({
    school: 'all',
    department: 'all',
    status: 'all', // This filter might be less relevant now or needs rethinking for "departmental" view
    searchTerm: '',
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // TODO: If students should only see dues for their department/school,
  // user.school and user.department would be needed here.
  // For now, showing all due definitions.
  const filteredDues = useMemo(() => {
    return allDueDefinitions.filter((due: Due) => {
      const schoolMatch = filters.school === 'all' || due.school === filters.school;
      const departmentMatch = filters.department === 'all' || due.department === filters.department;
      
      // Status filter is tricky: 'status' is now per-student for a given due definition.
      // This global status filter might not make sense or needs to check against the logged-in student's status for each due.
      // For simplicity, this iteration might ignore the status filter or interpret it as "show all dues that *could* have this status for *someone*".
      // Let's keep it simple: this filter will mostly affect admins or if we want to see general "Overdue" definitions.
      let statusMatch = true;
      if (filters.status !== 'all' && user) {
         // This is a complex filter to implement correctly here without iterating studentPayments for each due.
         // For now, let's assume the status filter applies to the due-date itself (e.g. show all Overdue definitions)
         if (filters.status === 'Overdue') {
            statusMatch = new Date(due.dueDate) < new Date() && !due.dueDate.endsWith('T00:00:00.000Z');
         } else if (filters.status === 'Unpaid') {
            // This is hard to define globally. A due is unpaid if *someone* hasn't paid it.
            // Let's interpret 'Unpaid' as "not yet due or overdue" from definition perspective
            statusMatch = new Date(due.dueDate) >= new Date();
         } else if (filters.status === 'Paid') {
            // This also cannot be determined globally from a due definition alone.
            // An admin might want to see all definitions for which *at least one* student has paid. Too complex for now.
            // So, the 'Paid' global filter might not show anything unless we have a different logic.
            statusMatch = false; // Or true to show all if 'Paid' is selected. Let's make it show nothing for now.
         }
      }


      const searchTermMatch = filters.searchTerm === '' || 
                              due.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      // Removed search by studentName as it's not on Due definition
                              
      return schoolMatch && departmentMatch && statusMatch && searchTermMatch;
    });
  }, [allDueDefinitions, filters, user]);

  // Dynamic unique schools and departments from current due definitions
  const currentUniqueSchools = useMemo(() => Array.from(new Set(allDueDefinitions.map(due => due.school))).sort(), [allDueDefinitions]);
  const currentUniqueDepartments = useMemo(() => Array.from(new Set(allDueDefinitions.map(due => due.department))).sort(), [allDueDefinitions]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dues Dashboard
      </h1>
      
      <DueFilters
        schools={currentUniqueSchools}
        departments={currentUniqueDepartments}
        statuses={dueStatuses} // These are general statuses for filtering UI
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {filteredDues.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDues.map((dueDefinition) => (
            // DueCard now handles student-specific payment status internally
            <DueCard key={dueDefinition.id} due={dueDefinition} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Dues Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search term. Admins can add new due definitions.
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

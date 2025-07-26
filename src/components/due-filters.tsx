
"use client";

import type { DueStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface DueFiltersProps {
  schools: string[];
  departments: string[];
  statuses: string[];
  onFilterChange: (filters: { school: string; department: string; status: string; searchTerm: string }) => void;
  initialFilters: { school: string; department: string; status: string; searchTerm: string };
}

export function DueFilters({ schools, departments, statuses, onFilterChange, initialFilters }: DueFiltersProps) {
  const [school, setSchool] = React.useState(initialFilters.school);
  const [department, setDepartment] = React.useState(initialFilters.department);
  const [status, setStatus] = React.useState(initialFilters.status);
  const [searchTerm, setSearchTerm] = React.useState(initialFilters.searchTerm);

  const handleApplyFilters = () => {
    onFilterChange({ school, department, status, searchTerm });
  };

  const handleResetFilters = () => {
    setSchool('all');
    setDepartment('all');
    setStatus('all');
    setSearchTerm('');
    onFilterChange({ school: 'all', department: 'all', status: 'all', searchTerm: '' });
  };

  React.useEffect(() => {
    // Optional: Auto-apply filters on change, or keep manual Apply button
    // handleApplyFilters(); 
  }, [school, department, status, searchTerm]);


  return (
    <Card className="mb-6 p-4 sm:p-6 shadow-lg bg-card">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl">Filter Dues</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="school-filter">School</Label>
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger id="school-filter" className="w-full">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="department-filter">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department-filter" className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="search-filter">Search Dues</Label>
            <div className="relative">
              <Input
                id="search-filter"
                type="text"
                placeholder="Search by description, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Need to import Card components for this to work
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

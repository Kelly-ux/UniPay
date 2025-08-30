
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Due, StudentPayment } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapDueRowToDue, mapDueToInsert, mapPaymentRowToPayment, type DueRow, type PaymentRow } from '@/lib/supabase/mappers';

interface DuesContextType {
	dues: Due[]; // Due definitions
	studentPayments: StudentPayment[];
	addDue: (newDueData: Omit<Due, 'id'>) => void; // Admin adds a due definition
	removeDue: (dueId: string) => void; // Admin removes a due definition
	recordStudentPayment: (dueId: string, studentId: string) => void;
	hasStudentPaid: (dueId: string, studentId: string) => boolean;
	getStudentPaymentDate: (dueId: string, studentId: string) => string | undefined;
	getDueById: (dueId: string) => Due | undefined;
}

const DuesContext = createContext<DuesContextType | undefined>(undefined);

const DUES_DEFINITIONS_STORAGE_KEY = 'duesPayDuesDefinitions';
const STUDENT_PAYMENTS_STORAGE_KEY = 'duesPayStudentPayments';


export const DuesProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth();
	const [dues, setDues] = useState<Due[]>(() => {
		if (typeof window !== 'undefined') {
			const savedDues = localStorage.getItem(DUES_DEFINITIONS_STORAGE_KEY);
			try {
				return savedDues ? JSON.parse(savedDues) : [];
			} catch (e) {
				console.error("Failed to parse dues from localStorage", e);
				localStorage.removeItem(DUES_DEFINITIONS_STORAGE_KEY);
				return [];
			}
		}
		return [];
	});

	const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(() => {
		if (typeof window !== 'undefined') {
			const savedPayments = localStorage.getItem(STUDENT_PAYMENTS_STORAGE_KEY);
			try {
				return savedPayments ? JSON.parse(savedPayments) : [];
			} catch (e) {
				console.error("Failed to parse student payments from localStorage", e);
				localStorage.removeItem(STUDENT_PAYMENTS_STORAGE_KEY);
				return [];
			}
		}
		return [];
	});

	// Fetch dues and payments from Supabase when user is present
	useEffect(() => {
		const fetchData = async () => {
			try {
				const supabase = createSupabaseBrowserClient();
				const { data: duesRows, error: duesErr } = await supabase
					.from('dues')
					.select('*')
					.order('due_date', { ascending: true });
				if (duesErr) throw duesErr;
				setDues((duesRows || []).map((r: any) => mapDueRowToDue(r as DueRow)));

				const { data: paymentRows, error: payErr } = await supabase
					.from('payments')
					.select('*');
				if (payErr) throw payErr;
				setStudentPayments((paymentRows || []).map((r: any) => mapPaymentRowToPayment(r as PaymentRow)));
			} catch (err) {
				console.error('Failed to fetch dues/payments from Supabase', err);
			}
		};
		if (user) fetchData();
	}, [user?.id]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(DUES_DEFINITIONS_STORAGE_KEY, JSON.stringify(dues));
		}
	}, [dues]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STUDENT_PAYMENTS_STORAGE_KEY, JSON.stringify(studentPayments));
		}
	}, [studentPayments]);


	const addDue = useCallback(async (newDueData: Omit<Due, 'id'>) => {
		if (user?.role !== 'admin') {
			toast({ title: 'Admin required', description: 'Only admins can add dues.', variant: 'destructive' });
			return;
		}
		try {
			const supabase = createSupabaseBrowserClient();
			const insertPayload = mapDueToInsert(newDueData);
			const { data, error } = await supabase
				.from('dues')
				.insert({ ...insertPayload, created_by: user?.id })
				.select('*')
				.single();
			if (error) throw error;
			setDues((prev) => [...prev, mapDueRowToDue(data as DueRow)]);
		} catch (err) {
			const e = err as any;
			console.error('Failed to add due via Supabase', e);
			const description = e?.message || e?.details || e?.hint || JSON.stringify(e);
			toast({ title: 'Unable to add due', description, variant: 'destructive' });
		}
	}, [user?.id, user?.role]);

	const removeDue = useCallback(async (dueIdToRemove: string) => {
		const dueToRemove = dues.find(d => d.id === dueIdToRemove);
		try {
			const supabase = createSupabaseBrowserClient();
			const { error } = await supabase
				.from('dues')
				.delete()
				.eq('id', dueIdToRemove);
			if (error) throw error;
			// Update local state only after a successful delete
			setDues((prevDues) => prevDues.filter(due => due.id !== dueIdToRemove));
			setStudentPayments((prevPayments) => prevPayments.filter(payment => payment.dueId !== dueIdToRemove));
			if (dueToRemove) {
				toast({
					title: "Due Removed",
					description: `The due "${dueToRemove.description}" has been successfully removed.`,
				});
			}
		} catch (err) {
			console.error('Failed to remove due via Supabase', err);
			toast({ title: 'Unable to remove due', description: (err as any)?.message || 'Admin permission required or network issue', variant: 'destructive' });
		}
	}, [dues]);

	const recordStudentPayment = useCallback(async (dueId: string, studentId: string) => {
		try {
			const supabase = createSupabaseBrowserClient();
			const { data, error } = await supabase
				.from('payments')
				.insert({
					due_id: dueId,
					auth_user_id: user?.id,
					student_id: studentId,
				})
				.select('*')
				.single();
			if (error) throw error;
			setStudentPayments((prev) => [...prev, mapPaymentRowToPayment(data as PaymentRow)]);
			return;
		} catch (err) {
			console.error('Failed to record payment via Supabase', err);
		}
		setStudentPayments((prevPayments) => {
			if (prevPayments.some(p => p.dueId === dueId && p.studentId === studentId)) {
				return prevPayments;
			}
			const newPayment: StudentPayment = {
				dueId,
				studentId,
				paymentDate: format(new Date(), 'yyyy-MM-dd'),
			};
			return [...prevPayments, newPayment];
		});
	}, [user?.id]);

	const hasStudentPaid = useCallback((dueId: string, studentId: string): boolean => {
		return studentPayments.some(p => p.dueId === dueId && p.studentId === studentId);
	}, [studentPayments]);

	const getStudentPaymentDate = useCallback((dueId: string, studentId: string): string | undefined => {
		const payment = studentPayments.find(p => p.dueId === dueId && p.studentId === studentId);
		return payment?.paymentDate;
	}, [studentPayments]);


	const getDueById = useCallback((dueId: string) => {
		return dues.find(due => due.id === dueId);
	}, [dues]);

	return (
		<DuesContext.Provider value={{ dues, studentPayments, addDue, removeDue, recordStudentPayment, hasStudentPaid, getStudentPaymentDate, getDueById }}>
			{children}
		</DuesContext.Provider>
	);
};

export const useDues = () => {
	const context = useContext(DuesContext);
	if (context === undefined) {
		throw new Error('useDues must be used within a DuesProvider');
	}
	return context;
};

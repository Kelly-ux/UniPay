import type { Due, StudentPayment } from '@/lib/types';

export interface DueRow {
	id: string;
	school: string;
	department: string;
	description: string;
	amount: number;
	due_date: string; // YYYY-MM-DD
	payment_method_suggestion?: string | null;
	created_by?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
}

export interface PaymentRow {
	id: string;
	due_id: string;
	auth_user_id: string;
	student_id: string | null;
	payment_date: string; // ISO date or date
}

export interface ProfileRow {
	id: string; // auth.users.id
	name: string | null;
	student_id: string | null;
	is_admin: boolean | null;
}

export function mapDueRowToDue(row: DueRow): Due {
	return {
		id: row.id,
		school: row.school,
		department: row.department,
		description: row.description,
		amount: row.amount,
		dueDate: row.due_date,
		paymentMethodSuggestion: row.payment_method_suggestion || undefined,
    imageUrl: row.image_url || undefined,
    imageAlt: row.image_alt || undefined,
	};
}

export function mapDueToInsert(due: Omit<Due, 'id'>) {
	return {
		school: due.school,
		department: due.department,
		description: due.description,
		amount: due.amount,
		due_date: due.dueDate,
		payment_method_suggestion: due.paymentMethodSuggestion ?? null,
    image_url: due.imageUrl ?? null,
    image_alt: due.imageAlt ?? null,
	};
}

export function mapPaymentRowToPayment(row: PaymentRow): StudentPayment {
	// Normalize to YYYY-MM-DD
	const dateOnly = row.payment_date.includes('T')
		? row.payment_date.split('T')[0]
		: row.payment_date;
	return {
		studentId: row.auth_user_id,
		dueId: row.due_id,
		paymentDate: dateOnly,
	};
}


'use server';

/**
 * @fileOverview AI-powered payment reminder generator.
 *
 * - generatePaymentReminder - A function that generates personalized payment reminders.
 * - GeneratePaymentReminderInput - The input type for the generatePaymentReminder function.
 * - GeneratePaymentReminderOutput - The return type for the generatePaymentReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// userName is now optional. If not provided, a more generic reminder is generated.
const GeneratePaymentReminderInputSchema = z.object({
  userName: z.string().optional().describe('The name of the user who owes the payment (if known).'),
  dueAmount: z.number().describe('The amount of the payment due.'),
  dueDate: z.string().describe('The due date of the payment (e.g., YYYY-MM-DD).'),
  schoolName: z.string().describe('The name of the school.'),
  departmentName: z.string().describe('The name of the department.'),
  paymentMethod: z.string().describe('The preferred method of payment'),
  description: z.string().optional().describe('Description of the due item (e.g., "Fall Semester Tuition Fee").'),
});

export type GeneratePaymentReminderInput = z.infer<
  typeof GeneratePaymentReminderInputSchema
>;

const GeneratePaymentReminderOutputSchema = z.object({
  reminderText: z.string().describe('The personalized payment reminder text.'),
});

export type GeneratePaymentReminderOutput = z.infer<
  typeof GeneratePaymentReminderOutputSchema
>;

export async function generatePaymentReminder(
  input: GeneratePaymentReminderInput
): Promise<GeneratePaymentReminderOutput> {
  return generatePaymentReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaymentReminderPrompt',
  input: {schema: GeneratePaymentReminderInputSchema},
  output: {schema: GeneratePaymentReminderOutputSchema},
  prompt: `You are a helpful assistant that generates payment reminders.

  Given the following information, create a friendly and professional payment reminder:

  {{#if description}}Due Item: {{{description}}}{{/if}}
  {{#if userName}}User Name: {{{userName}}}{{/if}}
  Due Amount: {{{dueAmount}}}
  Due Date: {{{dueDate}}}
  School: {{{schoolName}}}
  Department: {{{departmentName}}}
  Payment Method: {{{paymentMethod}}}

  {{#if userName}}
  Write a personalized payment reminder for {{{userName}}}.
  {{else}}
  Write a general payment reminder for students of {{{departmentName}}} at {{{schoolName}}}.
  {{/if}}
  
  The reminder should include all the above information. 
  The tone should be friendly but firm, and should encourage the user(s) to make the payment as soon as possible. 
  It should be no more than two short paragraphs.
  `,
});

const generatePaymentReminderFlow = ai.defineFlow(
  {
    name: 'generatePaymentReminderFlow',
    inputSchema: GeneratePaymentReminderInputSchema,
    outputSchema: GeneratePaymentReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

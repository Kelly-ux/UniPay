import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

export function getResendClient() {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    throw new Error('Missing RESEND_API_KEY or EMAIL_FROM');
  }
  const resend = new Resend(RESEND_API_KEY);
  return { resend, from: EMAIL_FROM };
}

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const { resend, from } = getResendClient();
  await resend.emails.send({ from, to, subject, html });
}


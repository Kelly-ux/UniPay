export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

export function isApiConfigured(): boolean {
  return API_BASE_URL.trim().length > 0;
}



import { Flame } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Flame className="h-7 w-7" />
      <span className="hidden sm:inline">UniPay</span>
    </Link>
  );
}

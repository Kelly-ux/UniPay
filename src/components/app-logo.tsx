
import { Flame } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1 -m-1">
      <Flame className="h-7 w-7" />
      <span className="hidden sm:inline">UniPay</span>
    </Link>
  );
}

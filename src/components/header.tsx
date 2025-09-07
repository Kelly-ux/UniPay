
"use client";

import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogOut, ShieldCheck, LogInIcon, History, LayoutDashboard } from 'lucide-react'; // Added History, LayoutDashboard
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const baseNavItems = [
  { href: '/', label: 'Dues Dashboard', icon: LayoutDashboard },
];

// Student specific nav items
const studentNavItems = [
  { href: '/payment-history', label: 'Payment History', icon: History },
];

// Admin specific nav items (to be shown in addition to base)
const adminNavItems = [
   { href: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];


export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  let navItems = user ? [...baseNavItems] : [];
  if (user?.role === 'student') {
    navItems = [...navItems, ...studentNavItems];
  } else if (user?.role === 'admin') {
     navItems = [...navItems, ...adminNavItems.filter(item => item.href !== '/admin')]; // Exclude admin panel itself from main nav
  }


  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 justify-between shadow-sm">
      <div className="flex items-center">
        {/* Desktop Navigation */}
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold md:text-base mr-4">
            <AppLogo />
            <span className="sr-only">DuesPay</span>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary flex items-center gap-2",
                pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
           <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  {/* Placeholder for user avatar image if available */}
                  {/* <AvatarImage src="/avatars/01.png" alt={user.name} /> */}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  {user.role === 'student' && user.studentId && (
                     <p className="text-xs leading-none text-muted-foreground pt-1">
                        ID: {user.studentId}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === 'admin' && (
                 <DropdownMenuItem asChild>
                    <Link href="/admin"> 
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">
              <LogInIcon className="mr-2 h-4 w-4"/>
              Login
            </Link>
          </Button>
        )}
        
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card"> {/* Matched mobile sheet bg to card for consistency */}
            <nav className="grid gap-6 text-lg font-medium pt-8">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <AppLogo />
                <span className="sr-only">DuesPay</span>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-primary flex items-center gap-2",
                    pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                 {item.icon && <item.icon className="h-5 w-5" />}
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

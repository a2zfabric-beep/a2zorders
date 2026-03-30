'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LogOut, Loader2 } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize Supabase Browser Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/orders', label: 'Orders', icon: 'package_2' },
    { href: '/clients', label: 'Clients', icon: 'group' },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.refresh(); // Clears middleware cache
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-1 transition-all
            ${isActive(item.href)
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl px-4'
              : ''
            }
          `}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-inter text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
        </Link>
      ))}

      {/* --- LOGOUT BUTTON --- */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex flex-col items-center justify-center text-slate-400 py-1 active:scale-95 disabled:opacity-50"
      >
        {isLoggingOut ? (
          <Loader2 className="animate-spin text-blue-600" size={20} />
        ) : (
          <LogOut size={20} className="mb-0.5" />
        )}
        <span className="font-inter text-[10px] font-bold uppercase tracking-widest">
          {isLoggingOut ? '...' : 'Exit'}
        </span>
      </button>
    </nav>
  );
}
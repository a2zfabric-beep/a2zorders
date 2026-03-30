'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Home, 
  LayoutDashboard, 
  Package, 
  Users, 
  ShieldCheck,
  LogOut,
  Loader2
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize Supabase Browser Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/orders', label: 'Orders', icon: <Package size={20} /> },
    { href: '/clients', label: 'Clients', icon: <Users size={20} /> },
    { href: '/admin', label: 'Admin', icon: <ShieldCheck size={20} /> },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full z-40 hidden md:flex flex-col p-6 bg-white border-r border-gray-100 w-64">
      {/* Logo Section */}
      <div className="mb-10 px-2">
        <span className="text-xl font-black text-blue-600 uppercase tracking-tighter leading-tight">
          Sample<br />Management
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-4 px-4 py-3.5 transition-all duration-200 rounded-xl
              ${isActive(item.href)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 font-bold'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 font-semibold'
              }
            `}
          >
            <span className={isActive(item.href) ? 'text-white' : 'text-gray-400'}>
              {item.icon}
            </span>
            <span className="text-[11px] tracking-widest uppercase font-black">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / Auth Section */}
      <div className="mt-auto pt-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl group"
        >
          <span className="text-gray-400 group-hover:text-red-600">
            {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
          </span>
          <span className="text-[11px] tracking-widest uppercase font-black">
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </span>
        </button>
        <p className="text-[7px] font-black text-gray-200 uppercase tracking-[0.2em] text-center mt-4">
          v1.0.0 Stable
        </p>
      </div>
    </aside>
  );
}
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize the Supabase Browser Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    setIsRedirecting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This tells Supabase where to send the user after Google login
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error:', error);
      setIsRedirecting(false);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 text-center">
          
          {/* Icon Header */}
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-200 transition-transform hover:scale-105 duration-300">
            <Lock size={36} strokeWidth={2.5} />
          </div>

          {/* Text Header */}
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
            Admin Portal
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
            Sample Order Management
          </p>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isRedirecting}
            className="group w-full relative flex items-center justify-center gap-4 py-5 px-6 bg-white border-2 border-gray-100 rounded-3xl font-black uppercase text-xs tracking-widest text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isRedirecting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <img 
                  src="https://www.google.com/favicon.ico" 
                  className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" 
                  alt="google" 
                />
                Continue with Google
              </>
            )}
          </button>

          {/* Footer Info */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Secure Enterprise Access</span>
          </div>
        </div>

        {/* Back Link */}
        <p className="text-center mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sample Management Dashboard",
  description: "Manage sample orders with analytics and automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${manrope.variable} font-inter bg-surface text-on-surface min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <Header />
          
          {/* Main Content Area */}
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 md:pl-64 min-h-screen pb-24 md:pb-8">
              <div className="max-w-7xl mx-auto px-6 py-10">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* BottomNavBar (Mobile Only) */}
        <BottomNav />
        
        {/* Contextual FAB (Mobile Only) */}
        <button className="fixed right-6 bottom-24 md:bottom-8 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform md:hidden">
          <span className="material-symbols-outlined">add</span>
        </button>
        
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

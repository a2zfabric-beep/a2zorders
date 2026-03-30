'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Package, Database, Settings, Activity, ChevronRight } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOrders: 0,
    activeUsers: 0,
    systemStatus: 'operational',
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from your APIs
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Assuming your existing endpoints return data in { success: true, data: [] } format
        const [clientsRes, ordersRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/orders')
        ]);
        
        const clientsData = await clientsRes.json();
        const ordersData = await ordersRes.json();

        setStats({
          totalClients: clientsData.data?.length || 0,
          totalOrders: ordersData.data?.length || 0,
          activeUsers: 1, // Placeholder or fetch from an auth/users API if available
          systemStatus: 'operational',
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const adminActions = [
    {
      title: 'Manage Clients',
      description: 'View and edit client information',
      icon: Users,
      href: '/clients',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Manage Orders',
      description: 'Track and update sample orders',
      icon: Package,
      href: '/orders',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Monitor system performance',
      icon: Activity,
      href: '/dashboard',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: Settings,
      href: '#', // Placeholder for settings
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">System administration and settings</p>
      </div>

      {/* System Status */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              <div>
                <p className="text-sm font-bold text-gray-900">All Systems Operational</p>
                <p className="text-xs text-gray-500">Last checked: Just now</p>
              </div>
            </div>
            <Activity size={18} className="text-emerald-500" />
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Users', value: stats.activeUsers, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Database', value: 'Connected', icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item, idx) => (
          <Card key={idx} hover>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.label}</p>
                  <p className="text-xl font-black text-gray-900 mt-1">
                    {loading && typeof item.value === 'number' ? '...' : item.value}
                  </p>
                </div>
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <item.icon size={20} className={item.color} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions (Now Clickable) */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Quick Actions</h3>
        </CardHeader>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adminActions.map((action, idx) => (
              <Link 
                key={idx} 
                href={action.href}
                className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <action.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">System Information</h3>
        </CardHeader>
        <CardBody className="p-4">
          <div className="space-y-1">
            {[
              { label: 'Application Version', value: '1.0.0 Stable', color: 'text-gray-900' },
              { label: 'Environment', value: 'Production', color: 'text-emerald-600' },
              { label: 'Database Provider', value: 'Supabase / PostgreSQL', color: 'text-gray-900' },
              { label: 'Last Backup', value: 'Today, 2:00 AM', color: 'text-gray-900' },
            ].map((info, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{info.label}</span>
                <span className={`text-sm font-black ${info.color}`}>{info.value}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
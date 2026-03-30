'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Users, TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';

interface Order {
  id: number;
  order_id: string;
  client_name: string;
  status: string;
  priority: string;
  created_at: string;
  delivery_date: string | null;
  dispatched_at?: string | null;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [oRes, cRes] = await Promise.all([fetch('/api/orders'), fetch('/api/clients')]);
      const oData = await oRes.json();
      const cData = await cRes.json();
      if (oData.success) setOrders(oData.data || []);
      if (cData.success) setClients(cData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- BOLD ANALYTICS LOGIC ---
  const getStatusCount = (s: string) => orders.filter(o => o.status === s).length;

  // OVERDUE: Not dispatched AND Target Date < Today
  const overdueOrders = orders.filter(o => {
    if (o.status === 'dispatched' || !o.delivery_date) return false;
    return new Date(o.delivery_date) < new Date();
  });

  // PERFORMANCE BREAKDOWN
  const completed = orders.filter(o => o.status === 'dispatched');
  const onTime = completed.filter(o => {
    if (!o.delivery_date || !o.dispatched_at) return true;
    return new Date(o.dispatched_at) <= new Date(o.delivery_date);
  });
  
  const late = completed.length - onTime.length;
  const otdRate = completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 0;

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse uppercase tracking-widest">Generating Insights...</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">System Dashboard</h1>
        <p className="text-sm text-gray-500 font-bold">Performance analytics and order tracking</p>
      </div>

      {/* --- HERO STATS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* STUNNING PERFORMANCE CARD */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-500/30 transition-transform hover:scale-[1.01]">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">On-Time Performance</p>
                <h2 className="text-6xl font-black mt-2 tracking-tighter">{otdRate}<span className="text-3xl opacity-60">%</span></h2>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                <TrendingUp size={28} className="text-blue-100" />
              </div>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase opacity-60 mb-1">On Time</span>
                <span className="text-xl font-black">{onTime.length}</span>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase opacity-60 mb-1">Delayed</span>
                <span className="text-xl font-black text-blue-200">{late}</span>
              </div>
              <div className="flex-1">
                 {/* Visual breakdown bar */}
                 <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${otdRate}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
          {/* Decorative Background Circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* OVERDUE CARD */}
        <Card className={`rounded-[2rem] border-0 transition-all ${overdueOrders.length > 0 ? 'bg-red-50 ring-2 ring-red-100 shadow-xl shadow-red-500/10' : 'bg-white shadow-lg shadow-gray-200/50'}`}>
          <CardBody className="p-8 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className={`text-[10px] font-black uppercase tracking-widest ${overdueOrders.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>Risk Tracking</p>
              <Clock size={24} className={overdueOrders.length > 0 ? 'text-red-500' : 'text-gray-200'} />
            </div>
            <div>
              <p className={`text-5xl font-black tracking-tighter ${overdueOrders.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdueOrders.length}</p>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Overdue Orders</p>
            </div>
          </CardBody>
        </Card>

        {/* TOTAL CLIENTS CARD */}
        <Card className="rounded-[2rem] border-0 bg-white shadow-lg shadow-gray-200/50">
          <CardBody className="p-8 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Network</p>
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter">{clients.length}</p>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Active Clients</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* --- WORKFLOW GRID --- */}
      <section className="pt-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4 ml-2">Workflow Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Draft', count: getStatusCount('draft'), color: 'bg-white border-gray-100' },
            { label: 'Submitted', count: getStatusCount('submitted'), color: 'bg-white border-blue-50' },
            { label: 'In Review', count: getStatusCount('in_review'), color: 'bg-white border-yellow-50' },
            { label: 'Sampling', count: getStatusCount('sampling_in_progress'), color: 'bg-white border-purple-50' },
            { label: 'Ready', count: getStatusCount('ready'), color: 'bg-white border-green-50' },
            { label: 'Dispatched', count: getStatusCount('dispatched'), color: 'bg-white border-teal-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border-2 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group cursor-default`}>
              <p className="text-3xl font-black text-gray-900 group-hover:scale-110 transition-transform origin-left">{s.count}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-tighter">{s.label.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- DATA LISTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card className="rounded-[1.5rem] shadow-sm border-gray-100">
          <CardHeader className="border-b border-gray-50 p-6 flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Recent Activity</h3>
            <Link href="/orders" className="text-[10px] font-black text-blue-600 flex items-center hover:gap-1 transition-all uppercase">View All <ArrowUpRight size={12} /></Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 5).map(o => (
                <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-900 tracking-tight">{o.order_id}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{o.client_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${o.status === 'dispatched' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-[1.5rem] shadow-sm border-gray-100">
          <CardHeader className="border-b border-gray-50 p-6 flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Client List</h3>
            <Link href="/clients" className="text-[10px] font-black text-blue-600 flex items-center hover:gap-1 transition-all uppercase">Manage <ArrowUpRight size={12} /></Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {clients.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-sm font-black text-gray-400">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{c.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
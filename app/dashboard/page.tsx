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
  production_workflow?: any; 
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

  // --- PRODUCTION STAGE ANALYTICS (ON-TIME vs DELAYED) ---
  const getStageStats = (stageId: number) => {
    // We only look at orders that have COMPLETED this specific stage
    const completedTasks = orders.filter(o => o.production_workflow?.[stageId]?.status === 'completed');
    
    if (completedTasks.length === 0) return { rate: 0, onTime: 0, delayed: 0, total: 0 };

    const onTimeCount = completedTasks.filter(o => {
      const s = o.production_workflow[stageId];
      if (!s.startDate || !s.actualDate) return true;
      
      const start = new Date(s.startDate).setHours(0,0,0,0);
      const end = new Date(s.actualDate).setHours(0,0,0,0);
      const used = Math.floor((end - start) / (1000 * 3600 * 24));
      
      return used <= (s.assignedDays || 0);
    }).length;

    const delayedCount = completedTasks.length - onTimeCount;
    const rate = Math.round((onTimeCount / completedTasks.length) * 100);

    return { rate, onTime: onTimeCount, delayed: delayedCount, total: completedTasks.length };
  };

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

      {/* --- STAGE PERFORMANCE TRACKER --- */}
      <section className="pt-4">
        <div className="flex justify-between items-end mb-4 ml-2">
           <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Stage Performance</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase">On-Time completion rate per production department</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { id: 1, label: 'Fabric Procurement', theme: 'blue' },
            { id: 2, label: 'Dyeing Stage', theme: 'pink' },
            { id: 3, label: 'Printing Stage', theme: 'indigo' },
            { id: 4, label: 'Embroidery Stage', theme: 'orange' },
            { id: 5, label: 'Pattern & Sampling', theme: 'emerald' },
          ].map((s) => {
            const stats = getStageStats(s.id);
            return (
              <div key={s.id} className="bg-white border-2 border-gray-50 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 leading-none">{stats.rate}%</span>
                    <span className="text-[8px] font-black uppercase text-gray-400 mt-1">Success Rate</span>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase`}>Stage {s.id}</span>
                </div>
                
                {/* Visual Performance Bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${stats.rate < 70 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${stats.rate}%` }}
                  ></div>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-[10px] font-black text-gray-800 uppercase leading-tight h-8 line-clamp-2">{s.label}</p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-emerald-600 leading-none">{stats.onTime}</p>
                    <p className="text-[7px] font-bold text-gray-400 uppercase">On-Time</p>
                  </div>
                  <div className="h-4 w-px bg-gray-100"></div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-red-500 leading-none">{stats.delayed}</p>
                    <p className="text-[7px] font-bold text-gray-400 uppercase">Delayed</p>
                  </div>
                  <div className="h-4 w-px bg-gray-100"></div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-900 leading-none">{stats.total}</p>
                    <p className="text-[7px] font-bold text-gray-400 uppercase">Total</p>
                  </div>
                </div>
              </div>
            );
          })}
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
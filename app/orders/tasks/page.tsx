'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, ChevronRight, Search } from 'lucide-react';
import Card, { CardBody } from '@/components/ui/Card';

export default function ProductionTasksPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/orders?status=submitted,in_review,sampling_in_progress')
      .then(res => res.json())
      .then(data => {
        setOrders(data.data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Production Tasks</h1>
          <p className="text-sm text-gray-500 font-medium">Track granular stages for submitted orders</p>
        </div>
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
           <input 
            className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-bold"
            placeholder="Search by Order ID or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <p className="text-[10px] font-black uppercase opacity-70">Active Tasks</p>
            <p className="text-2xl font-black mt-1">{orders.length * 5}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase">Avg. Production Delay</p>
            <p className="text-2xl font-black text-red-500 mt-1">2.4 Days</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase">On-Time Completion</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">88%</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:border-blue-200 transition-all group">
            <CardBody className="p-0">
              <Link href={`/orders/${order.id}`} className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{order.order_id}</p>
                  <h3 className="text-lg font-black text-gray-900">{order.client_name}</h3>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-gray-100 rounded">5 Stages</span>
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-orange-50 text-orange-600 rounded">Priority: {order.priority}</span>
                  </div>
                </div>

                {/* Mini Workflow Progress Bar */}
                <div className="flex-1 w-full max-w-xs">
                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 mb-2">
                        <span>Workflow Progress</span>
                        <span>60%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Target Delivery</p>
                        <p className="text-sm font-black text-gray-900">{order.delivery_date || 'N/A'}</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
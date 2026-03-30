'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Users, ArrowRight, LayoutDashboard, X, ChevronDown } from 'lucide-react';

// --- Reusable Modal UI (matching your screenshot style) ---
const ModalUI = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    style_name: '',
    item_number: '',
    quantity: 1,
    priority: 'medium'
  });

  // Fetch clients for the dropdown when modal opens
  useEffect(() => {
    if (isOrderModalOpen) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => setClients(data.data || []));
    }
  }, [isOrderModalOpen]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: parseInt(formData.client_id),
          styles: [{
            style_name: formData.style_name,
            item_number: formData.item_number,
            quantity: formData.quantity,
            print_type: 'solid_dyed'
          }]
        }),
      });
      if (res.ok) {
        alert('Order Created!');
        setOrderModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Real-time analytics with order metrics, status tracking, and visualizations',
      href: '/dashboard',
      color: 'from-blue-500 to-blue-600',
      items: ['Total orders and samples', 'Status breakdown', 'Priority analytics', 'Recent orders overview'],
    },
    {
      icon: Package,
      title: 'Orders',
      description: 'Create and manage sample orders with multiple styles and file uploads',
      href: '/orders',
      color: 'from-emerald-500 to-emerald-600',
      items: ['Quick vs structured entry', 'Multiple styles per order', 'Design file uploads', '6-stage workflow'],
    },
    {
      icon: Users,
      title: 'Clients',
      description: 'Manage client information and track order history',
      href: '/clients',
      color: 'from-violet-500 to-violet-600',
      items: ['Client profiles', 'Contact information', 'Order history', 'Quick lookup'],
    },
  ];

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Sample Order
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"> Management</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Production-ready system for managing sample orders with real-time analytics,
            client management, and automated workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setOrderModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-1.5">
                  {feature.items.map((item) => (
                    <li key={item} className="text-xs text-gray-500 flex items-center">
                      <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ready to Get Started? Section */}
      <section className="bg-blue-50/50 rounded-xl p-8 md:p-10 border border-blue-100/50">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Create your first sample order and experience the streamlined workflow
          </p>
          <button
            onClick={() => setOrderModalOpen(true)}
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
          >
            Create Your First Order
          </button>
        </div>
      </section>

      {/* Create Order Modal (Integrated Logic) */}
      <ModalUI isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} title="Create New Sample Order">
        <form onSubmit={handleOrderSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Select Client *</label>
            <div className="relative">
              <select 
                className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm"
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
                required
              >
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Style Name *</label>
              <input 
                type="text" 
                className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none" 
                value={formData.style_name} 
                onChange={e => setFormData({...formData, style_name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Item Number *</label>
              <input 
                type="text" 
                className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none" 
                value={formData.item_number} 
                onChange={e => setFormData({...formData, item_number: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'CREATING...' : 'Confirm & Create Order'}
          </button>
        </form>
      </ModalUI>
    </div>
  );
}
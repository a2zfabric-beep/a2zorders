'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, X, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface OrderStyle {
  id?: number;
  item_number: string;
  style_number?: string | null;
  style_name: string;
  print_type: 'solid_dyed' | 'printed';
  color_name: string | null;
  pantone_number: string | null;
  design_name: string | null;
  fabric: string | null;
  quantity: number;
  notes: string | null;
}

interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
}

interface Order {
  id: number;
  order_id: string;
  client_id: number;
  client: Client;
  status: 'draft' | 'submitted' | 'in_review' | 'sampling_in_progress' | 'ready' | 'dispatched';
  created_by: 'client' | 'admin' | 'automation';
  order_source: 'quick' | 'structured' | 'email';
  delivery_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sample_type: string | null;
  notes: string | null;
  batch_id: string | null;
  is_order_created: boolean;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  styles: OrderStyle[];
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    delivery_date: '',
    sample_type: '',
    notes: '',
  });
  const [styles, setStyles] = useState<OrderStyle[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        setFormData({
          priority: data.data.priority,
          delivery_date: data.data.delivery_date || '',
          sample_type: data.data.sample_type || '',
          notes: data.data.notes || '',
        });
        setStyles(data.data.styles || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = (index: number, field: keyof OrderStyle, value: any) => {
    const updatedStyles = [...styles];
    updatedStyles[index] = { ...updatedStyles[index], [field]: value };
    setStyles(updatedStyles);
  };

  const handleSave = async () => {
    if (!order) return;
    try {
      setSaving(true);
      const updates = {
        ...formData,
        styles: styles // Sending the full styles array to the API
      };

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert('Order updated successfully!');
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Order...</div>;
  if (error || !order) return <div className="p-20 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.push(`/orders/${orderId}`)} className="mr-4 text-gray-400 hover:text-gray-600">
               <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Editing Order {order.order_id}</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Order Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b pb-2">Order Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Delivery Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Sample Type</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                value={formData.sample_type}
                onChange={(e) => setFormData({...formData, sample_type: e.target.value})}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Internal Order Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Styles List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Style Management ({styles.length})</h2>
            <button 
              onClick={() => setStyles([...styles, { item_number: '', style_name: '', print_type: 'solid_dyed', color_name: '', pantone_number: '', design_name: '', fabric: '', quantity: 1, notes: '' }])}
              className="text-blue-600 text-xs font-bold flex items-center hover:underline"
            >
              <Plus size={14} className="mr-1" /> Add Another Style
            </button>
          </div>

          <div className="space-y-8">
            {styles.map((style, index) => (
              <div key={index} className="relative p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                <button 
                  onClick={() => setStyles(styles.filter((_, i) => i !== index))}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Item Number</label>
                    <input className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.item_number} onChange={(e) => handleStyleChange(index, 'item_number', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Style Name</label>
                    <input className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.style_name} onChange={(e) => handleStyleChange(index, 'style_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Quantity</label>
                    <input type="number" className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.quantity} onChange={(e) => handleStyleChange(index, 'quantity', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fabric</label>
                    <input className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.fabric || ''} onChange={(e) => handleStyleChange(index, 'fabric', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Color Name</label>
                    <input className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.color_name || ''} onChange={(e) => handleStyleChange(index, 'color_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pantone #</label>
                    <input className="w-full border-gray-200 rounded p-2 text-xs bg-white" value={style.pantone_number || ''} onChange={(e) => handleStyleChange(index, 'pantone_number', e.target.value)} />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Style-Specific Notes</label>
                    <textarea className="w-full border-gray-200 rounded p-2 text-xs bg-white" rows={2} value={style.notes || ''} onChange={(e) => handleStyleChange(index, 'notes', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- THE ACTION FOOTER (FIXED POSITION AT BOTTOM) --- */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2"
            >
              Discard & Go Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Confirm Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
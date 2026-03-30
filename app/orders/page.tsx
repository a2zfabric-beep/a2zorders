'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Search, Filter, Plus, Download, ArrowUpDown, Eye, Edit, MoreVertical, Upload, X, UserPlus } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import OrderModal from '@/components/modals/OrderModal';
import ClientModal from '@/components/modals/ClientModal';

interface Order {
  id: number;
  order_id: string;
  client_id: number;
  client_name: string;
  client_email: string;
  status: 'draft' | 'submitted' | 'in_review' | 'sampling_in_progress' | 'ready' | 'dispatched';
  created_by: 'client' | 'admin' | 'automation';
  order_source: 'quick' | 'structured' | 'email';
  delivery_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sample_type: string | null;
  notes: string | null;
  style_count: number;
  fabric?: string;
  print_type?: 'solid_dyed' | 'printed';
  created_at: string;
  updated_at: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
}

type SortField = 'order_id' | 'client_name' | 'status' | 'created_at' | 'priority';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const router = useRouter();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      if (data.success) setClients(data.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_review', label: 'In Review' },
    { value: 'sampling_in_progress', label: 'Sampling' },
    { value: 'ready', label: 'Ready' },
    { value: 'dispatched', label: 'Dispatched' },
  ];

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    ...clients.map(client => ({ value: client.id.toString(), label: client.name }))
  ];

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = search === '' || 
        order.order_id.toLowerCase().includes(search.toLowerCase()) ||
        order.client_name.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesClient = clientFilter === 'all' || order.client_id.toString() === clientFilter;
      
      return matchesSearch && matchesStatus && matchesClient;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'order_id': comparison = a.order_id.localeCompare(b.order_id); break;
        case 'client_name': comparison = a.client_name.localeCompare(b.client_name); break;
        case 'status': comparison = a.status.localeCompare(b.status); break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'created_at': comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWorkflowStep = (status: string) => {
    const steps = ['draft', 'submitted', 'in_review', 'sampling_in_progress', 'ready', 'dispatched'];
    return steps.indexOf(status) + 1;
  };

  if (loading) return <div className="p-20 text-center">Loading Orders...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sample Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage and track all sample orders</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowOrderModal(true)}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" /> CREATE ORDER
          </button>
          <button 
            onClick={() => setShowClientModal(true)}
            className="flex items-center px-5 py-2.5 border-2 border-gray-100 text-gray-700 rounded-xl text-sm font-black hover:bg-gray-50 transition-all active:scale-95"
          >
            <UserPlus size={18} className="mr-2" /> ADD CLIENT
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex-1">
              <Input
                icon="search"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
              <Select options={clientOptions} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-gray-900 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-4 py-4 text-left cursor-pointer" onClick={() => handleSort('order_id')}>Order ID</th>
                  <th className="px-4 py-4 text-left cursor-pointer" onClick={() => handleSort('client_name')}>Client</th>
                  <th className="px-4 py-4 text-left cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                  <th className="px-4 py-4 text-left cursor-pointer" onClick={() => handleSort('priority')}>Priority</th>
                  <th className="px-4 py-4 text-left">Progress</th>
                  <th className="px-4 py-4 text-left">Styles</th>
                  <th className="px-4 py-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>Date</th>
                  <th className="px-4 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline text-xs font-bold">{order.order_id}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-gray-900">{order.client_name}</div>
                      <div className="text-[10px] text-gray-500">{order.client_email}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.priority} /></td>
                    <td className="px-4 py-3 text-[10px] text-gray-500 font-bold">Step {getWorkflowStep(order.status)} of 6</td>
                    <td className="px-4 py-3 text-xs font-bold">{order.style_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Link href={`/orders/${order.id}`} className="p-1 text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                        <Link href={`/orders/${order.id}/edit`} className="p-1 text-gray-400 hover:text-gray-600"><Edit size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <OrderModal isOpen={showOrderModal} onClose={() => { setShowOrderModal(false); fetchOrders(); }} />
      <ClientModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} />
    </div>
  );
}
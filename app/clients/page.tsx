'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Building, Plus, Mail, Phone, Eye, Edit, Trash2, UserPlus, Download, Search } from 'lucide-react';
import Card, { CardBody } from '@/components/ui/Card';
import ClientModal from '@/components/modals/ClientModal';
import OrderModal from '@/components/modals/OrderModal';

interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients');
      const data = await response.json();
      if (data.success) setClients(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-20 text-center font-bold">Loading Clients...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Client Directory</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your relationships and accounts</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-black hover:bg-gray-50 transition-all active:scale-95"
          >
            <Download size={18} className="mr-2" /> EXPORT
          </button>
          <button 
            onClick={() => setShowClientModal(true)}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <UserPlus size={18} className="mr-2" /> ADD CLIENT
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:border-blue-500 outline-none transition-all"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr className="text-gray-900 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4 text-left">Client Name</th>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-left">Contact Info</th>
                  <th className="px-6 py-4 text-left">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black mr-3">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                        {client.company_name || 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-gray-600">{client.email}</div>
                      <div className="text-[10px] text-gray-400">{client.phone || 'No Phone'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => { setEditingClient(client); setShowClientModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={16}/>
                        </button>
                        
                        <button 
  onClick={async () => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        const res = await fetch(`/api/clients?id=${client.id}`, { method: 'DELETE' });
        const result = await res.json();

        if (res.ok && result.success) {
          alert("Client deleted successfully");
          fetchClients(); // Refresh the list
        } else {
          // This will now show: "Cannot delete: This client has X active order(s)..."
          alert(result.error || "Failed to delete client.");
        }
      } catch (err) {
        alert("A network error occurred. Please try again.");
      }
    }
  }}
  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
>
  <Trash2 size={16}/>
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <ClientModal 
        isOpen={showClientModal} 
        editingClient={editingClient}
        onClose={() => { 
          setShowClientModal(false); 
          setEditingClient(null);
          fetchClients(); 
        }} 
      />
      <OrderModal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </div>
  );
}
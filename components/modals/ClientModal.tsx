'use client';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

export default function ClientModal({ isOpen, onClose, editingClient }: { isOpen: boolean, onClose: () => void, editingClient?: any }) {
  const [formData, setFormData] = useState({ name: '', email: '', company_name: '' });

  useEffect(() => {
    if (editingClient) setFormData(editingClient);
    else setFormData({ name: '', email: '', company_name: '' });
  }, [editingClient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingClient ? 'PUT' : 'POST';
    const res = await fetch('/api/clients', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingClient ? { id: editingClient.id, ...formData } : formData),
    });
    if (res.ok) { onClose(); window.location.reload(); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingClient ? "Edit Client" : "Add Client"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-3 rounded-xl" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input className="w-full border p-3 rounded-xl" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase">
          {editingClient ? 'Update Client' : 'Create Client'}
        </button>
      </form>
    </Modal>
  );
}
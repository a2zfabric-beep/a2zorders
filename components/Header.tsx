'use client';
import { useState } from 'react';
import { Plus, ChevronDown, UserPlus, PackagePlus } from 'lucide-react';
import ClientModal from './modals/ClientModal';
import OrderModal from './modals/OrderModal'; // Import the new modal

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center space-x-2 shadow-xl transition-all active:scale-95"
        >
          <span>CREATE</span>
          <Plus size={18} />
          <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[100]">
            <button 
              onClick={() => { setShowOrderModal(true); setIsOpen(false); }}
              className="w-full flex items-center px-5 py-4 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold"
            >
              <PackagePlus size={20} className="mr-4 text-blue-500" /> New Sample Order
            </button>
            <button 
              onClick={() => { setShowClientModal(true); setIsOpen(false); }}
              className="w-full flex items-center px-5 py-4 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold"
            >
              <UserPlus size={20} className="mr-4 text-indigo-500" /> Register New Client
            </button>
          </div>
        )}
      </div>

      <ClientModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} />
      <OrderModal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </div>
  );
}
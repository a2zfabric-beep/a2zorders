import { MoreVertical, Eye, Edit, Download } from 'lucide-react';

const orders = [
  {
    id: 'SO-0012',
    client: 'Fashion Inc',
    styles: 3,
    status: 'in_review',
    date: '2024-03-15',
    priority: 'high',
  },
  {
    id: 'SO-0011',
    client: 'Apparel Co',
    styles: 1,
    status: 'sampling_in_progress',
    date: '2024-03-14',
    priority: 'medium',
  },
  {
    id: 'SO-0010',
    client: 'Textile Ltd',
    styles: 5,
    status: 'ready',
    date: '2024-03-13',
    priority: 'low',
  },
  {
    id: 'SO-0009',
    client: 'Fashion Inc',
    styles: 2,
    status: 'dispatched',
    date: '2024-03-12',
    priority: 'medium',
  },
  {
    id: 'SO-0008',
    client: 'Garment Works',
    styles: 4,
    status: 'submitted',
    date: '2024-03-11',
    priority: 'high',
  },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  sampling_in_progress: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-medium text-gray-900">{order.id}</h3>
                  <p className="text-sm text-gray-500">{order.client}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <span>{order.styles} styles</span>
                <span>•</span>
                <span>{order.date}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[order.priority]}`}>
                  {order.priority}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center">
          <Download className="h-4 w-4 mr-2" />
          Download Order Report
        </button>
      </div>
    </div>
  );
}
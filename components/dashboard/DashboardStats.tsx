import { Package, CheckCircle, Clock, Truck, AlertCircle, Users } from 'lucide-react';

const stats = [
  {
    title: 'Total Orders',
    value: '142',
    change: '+12%',
    icon: Package,
    color: 'bg-blue-500',
    trend: 'up',
  },
  {
    title: 'Samples Received',
    value: '89',
    change: '+8%',
    icon: CheckCircle,
    color: 'bg-green-500',
    trend: 'up',
  },
  {
    title: 'Pending Orders',
    value: '32',
    change: '-5%',
    icon: Clock,
    color: 'bg-yellow-500',
    trend: 'down',
  },
  {
    title: 'Dispatched',
    value: '67',
    change: '+15%',
    icon: Truck,
    color: 'bg-purple-500',
    trend: 'up',
  },
  {
    title: 'In Review',
    value: '21',
    change: '+3%',
    icon: AlertCircle,
    color: 'bg-orange-500',
    trend: 'up',
  },
  {
    title: 'Active Clients',
    value: '24',
    change: '+18%',
    icon: Users,
    color: 'bg-indigo-500',
    trend: 'up',
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <div className="flex items-baseline mt-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <span
                  className={`ml-2 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
'use client';

import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsCharts() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Weekly
          </button>
          <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Monthly
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders by Status Chart */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Orders by Status</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {[
              { status: 'Draft', count: 12, color: 'bg-gray-400', percent: 15 },
              { status: 'Submitted', count: 21, color: 'bg-blue-500', percent: 26 },
              { status: 'In Review', count: 18, color: 'bg-yellow-500', percent: 22 },
              { status: 'Sampling', count: 14, color: 'bg-purple-500', percent: 17 },
              { status: 'Ready', count: 9, color: 'bg-green-500', percent: 11 },
              { status: 'Dispatched', count: 7, color: 'bg-indigo-500', percent: 9 },
            ].map((item) => (
              <div key={item.status} className="flex items-center">
                <div className="w-24">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${item.color} mr-2`} />
                    <span className="text-sm text-gray-700">{item.status}</span>
                  </div>
                </div>
                <div className="flex-1 ml-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Trend */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Orders Trend</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-48 flex items-end space-x-2">
            {[40, 65, 80, 60, 90, 75, 85].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total this week</p>
                <p className="text-xl font-bold text-gray-900">142 orders</p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Type Distribution */}
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Print Type Distribution</h3>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <div className="text-sm text-gray-600">Solid Dyed</div>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '68%' }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">32%</div>
            <div className="text-sm text-gray-600">Printed</div>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: '32%' }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24%</div>
            <div className="text-sm text-gray-600">With Logos</div>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '24%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
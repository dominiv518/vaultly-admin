import React from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, DollarSign, CreditCard, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const recentTransactions = [
  { id: 1, name: 'Grocery Shopping', date: 'Today, 10:24 AM', amount: -120.50, type: 'expense', category: 'Food' },
  { id: 2, name: 'Salary Deposit', date: 'Yesterday, 09:00 AM', amount: 4500.00, type: 'income', category: 'Income' },
  { id: 3, name: 'Electric Bill', date: 'Jul 5, 02:15 PM', amount: -85.20, type: 'expense', category: 'Utilities' },
  { id: 4, name: 'Netflix Subscription', date: 'Jul 2, 10:00 AM', amount: -15.99, type: 'expense', category: 'Entertainment' },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 min-h-full w-full bg-[#080E1A] text-white font-sans">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-50">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-teal-500/20 cursor-pointer">
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:border-teal-500/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
              <h3 className="text-3xl font-bold text-white">$14,235.00</h3>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400 z-10">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10">
            <span className="flex items-center text-teal-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              +12.5%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors"></div>
        </div>

        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Monthly Income</p>
              <h3 className="text-3xl font-bold text-white">$4,500.00</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400 z-10">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10">
            <span className="flex items-center text-green-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              +4.2%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Monthly Expenses</p>
              <h3 className="text-3xl font-bold text-white">$2,854.20</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400 z-10">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10">
            <span className="flex items-center text-red-400 font-medium">
              <ArrowUpRight size={16} className="mr-1" />
              +8.1%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Activity size={20} className="text-teal-500" />
              Cash Flow
            </h2>
            <select className="bg-[#1A2236] border border-gray-700 text-sm text-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none">
              <option>Last 7 months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2236', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <CreditCard size={20} className="text-teal-500" />
              Recent Transactions
            </h2>
            <a href="#" className="text-sm font-medium text-teal-400 hover:text-teal-300">View All</a>
          </div>
          
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1A2236] transition-colors -mx-3">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{tx.name}</p>
                    <p className="text-xs text-gray-500">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

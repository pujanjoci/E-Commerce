import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

export const revalidate = 0; // Force dynamic for admin

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Basic stats fetching
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { data: salesData } = await supabase.from('orders').select('total_amount').eq('status', 'paid');
  
  const totalRevenue = salesData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Orders', value: orderCount || 0, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Products', value: productCount || 0, icon: Package, color: 'text-sky-600', bg: 'bg-sky-50' },
    { name: 'Active Users', value: '---', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back to the admin portal. Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-3 rounded-md ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 truncate">{stat.name}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
          <div className="flex items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500 text-sm">No recent orders to display.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Products</h2>
          <div className="flex items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500 text-sm">No top products data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

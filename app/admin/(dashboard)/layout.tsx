import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '../_components/AdminSidebar';

type UserLookup = { id: string }
type AdminLookup = { id: string }
type UsersLookupTable = {
  select: (columns: string) => {
    eq: (column: 'auth_id', value: string) => {
      single: () => Promise<{ data: UserLookup | null; error: { message: string } | null }>
    }
  }
}
type AdminLookupTable = {
  select: (columns: string) => {
    eq: (column: 'user_id', value: string) => {
      maybeSingle: () => Promise<{ data: AdminLookup | null; error: { message: string } | null }>
    }
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Resilient admin check using direct table lookup
  const usersTable = supabase.from('users') as unknown as UsersLookupTable;
  const { data: userData } = await usersTable
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!userData) {
    redirect('/');
  }

  const adminUsersTable = supabase.from('admin_users') as unknown as AdminLookupTable;
  const { data: adminData } = await adminUsersTable
    .select('id')
    .eq('user_id', userData.id)
    .maybeSingle();

  if (!adminData) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

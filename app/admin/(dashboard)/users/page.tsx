import { createClient } from '@/lib/supabase/server';
import { promoteToAdmin } from '@/app/actions/admin';
import { ShieldCheck, UserPlus, Mail, Calendar } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all users (internal users table)
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      *,
      admin_users (
        id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-rose-500 bg-rose-50 rounded-xl border border-rose-100">Error loading users: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage roles and promote existing users to administrative status.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isAdmin = Boolean(user.admin_users);
                
                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold ring-1 ring-accent/20">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-muted-foreground text-xs font-semibold">
                          Regular User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {!isAdmin && (
                        <form action={async () => {
                          'use server';
                          await promoteToAdmin(user.id);
                        }}>
                          <button 
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-accent hover:text-white hover:border-accent rounded-lg text-sm font-bold transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                            Promote to Admin
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

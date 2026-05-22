'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import bcrypt from 'bcryptjs';

type PublicUser = { id: string; email: string }
type AdminAuthUser = { id: string; test_key: string | null; verification_key: string | null }
type UsersTable = {
  select: (columns: string) => { eq: (column: 'email', value: string) => Promise<{ data: PublicUser[] | null; error: { message: string } | null }> }
}
type AdminUsersTable = {
  select: (columns: string) => {
    eq: (column: 'user_id', value: string) => {
      single: () => Promise<{ data: AdminAuthUser | null; error: { message: string } | null }>
    }
  }
}

export async function login(formData: FormData) {
  const email    = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Since Supabase Auth doesn't have the user from our SQL seed,
  // we do a direct check against our admin_users proxy table.
  const supabase = await createAdminClient();

  // Find user by email in public.users
  const usersTable = supabase.from('users') as unknown as UsersTable;
  const { data: users, error: userError } = await usersTable
    .select('id, email')
    .eq('email', email);

  if (userError || !users || users.length === 0) {
    // If not found by email, also gracefully check if they typed "testkey" into email
    if (email === process.env.ADMIN_TEST_KEY) {
      const cookieStore = await cookies();
      cookieStore.set('x-admin-dev-key', email, {
        httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 8,
      });
      redirect('/admin');
    }
    return { error: 'Invalid login credentials' };
  }

  // Found public user, now check if they are an admin
  const user = users[0];
  const adminUsersTable = supabase.from('admin_users') as unknown as AdminUsersTable;
  const { data: adminUser } = await adminUsersTable
    .select('id, test_key, verification_key')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return { error: 'Unauthorized access level' };
  }

  // Check 1: Does password equal the raw test_key?
  let isValid = false;
  if (adminUser.test_key && password === adminUser.test_key) {
    isValid = true;
  }
  
  // Check 2: Does password match the bcrypt verification_key?
  if (!isValid && adminUser.verification_key) {
    // Postgres crypt uses standard bcrypt $2a$ format which bcryptjs supports
    isValid = bcrypt.compareSync(password, adminUser.verification_key);
  }

  if (isValid) {
    // Success: They are verified as an admin!
    // We issue the dev cookie so the proxy middleware bypasses standard auth rules.
    const cookieStore = await cookies();
    cookieStore.set('x-admin-dev-key', String(process.env.ADMIN_TEST_KEY || 'valid'), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    });
    redirect('/admin');
  }

  return { error: 'Invalid login credentials' };
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  redirect('/login?message=Check your email to confirm your account');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

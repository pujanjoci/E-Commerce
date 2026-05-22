
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  console.log('Checking for users...');
  const { data: users, error: userError } = await supabase.from('users').select('*');
  if (userError) {
    console.error('Error fetching users:', userError);
  } else {
    console.log('Users found:', users.length);
    console.log(JSON.stringify(users, null, 2));
  }

  console.log('\nChecking for admin_users...');
  const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*');
  if (adminError) {
    console.error('Error fetching admin_users:', adminError);
  } else {
    console.log('Admin users found:', adminUsers.length);
    console.log(JSON.stringify(adminUsers, null, 2));
  }
}

checkAdmin();

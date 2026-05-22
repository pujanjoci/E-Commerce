
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  try {
    console.log('--- DB CHECK ---');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) {
      console.error('Error fetching users:', userError);
    } else {
      console.log('Users found:', users.length);
      users.forEach(u => console.log(`- ${u.email} (${u.id})`));
    }

    const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*');
    if (adminError) {
      console.error('Error fetching admin_users:', adminError);
    } else {
      console.log('\nAdmin users found:', adminUsers.length);
      adminUsers.forEach(au => console.log(`- UserID: ${au.user_id}, TestKey: ${au.test_key}`));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAdmin();

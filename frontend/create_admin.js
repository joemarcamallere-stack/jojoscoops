import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdmin() {
  const username = 'jireh';
  const password = 'faith1';
  const email = `${username}@jojos.com`;
  
  console.log(`Creating Admin user: ${username} (${email})...`);
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      fullname: username,
      username: username,
      role: 'admin'
    }
  });

  if (error) {
    if (error.message.includes('already exists')) {
       console.log('User already exists. Updating role to admin...');
       const { data: users } = await supabaseAdmin.auth.admin.listUsers();
       const existingUser = users.users.find(u => u.email === email);
       if (existingUser) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
             password: password,
             user_metadata: { ...existingUser.user_metadata, role: 'admin' }
          });
          console.log(`Successfully updated ${username} to admin.`);
       }
    } else {
       console.error(`Error creating admin:`, error.message);
    }
  } else {
    console.log(`Successfully created ${username} as Admin.`);
  }
}

createAdmin();

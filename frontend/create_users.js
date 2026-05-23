import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser(username, password, role) {
  const email = `${username}@jojos.com`; // Dummy email since Supabase requires one
  
  // Enforce minimum 6 char password for Supabase
  const finalPassword = password.length < 6 ? password + '1' : password;

  console.log(`Creating ${role} user: ${username} (${email})...`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: finalPassword,
    options: {
      data: {
        fullname: username,
        username: username,
        role: role
      }
    }
  });

  if (error) {
    console.error(`Error creating ${username}:`, error.message);
  } else {
    console.log(`Successfully created ${username}.`);
  }
}

async function run() {
  await createUser('jireh', 'faith', 'admin');
  await createUser('jai', '212121', 'staff');
  console.log('Done!');
}

run();

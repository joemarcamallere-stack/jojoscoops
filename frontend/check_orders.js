import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkOrders() {
  const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest orders:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

checkOrders();

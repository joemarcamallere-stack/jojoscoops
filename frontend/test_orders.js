import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const userId = '11111111-1111-1111-1111-111111111111'; // Dummy UUID
  const guestOrderIds = [1, 2];

  let query = supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false });

  query = query.or(`customer_user_id.eq.${userId},id.in.(${guestOrderIds.join(',')})`);

  const { data, error } = await query;
  console.log("Data:", data);
  console.log("Error:", error);
}

testFetch();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createBucket() {
  const { data, error } = await supabaseAdmin.storage.createBucket('product-images', {
    public: true,
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket product-images already exists.');
    } else {
      console.error('Error creating bucket:', error);
    }
  } else {
    console.log('Bucket product-images created successfully.');
  }
}

createBucket();

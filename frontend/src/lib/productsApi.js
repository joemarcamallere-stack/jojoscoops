import { supabase } from './supabaseClient';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

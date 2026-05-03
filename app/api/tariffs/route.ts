import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  let query = supabase
    .from('tariffs')
    .select('*, country:countries(id, name, code)')
    .order('product_category');

  if (country) query = query.eq('country_id', country);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

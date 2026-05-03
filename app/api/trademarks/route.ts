import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const category = searchParams.get('category');

  let query = supabase
    .from('trademarks')
    .select('*, country:countries(id, name, code)')
    .order('name');

  if (q) query = query.ilike('name', `%${q}%`);
  if (country) query = query.eq('country_id', country);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

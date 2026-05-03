import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const year = searchParams.get('year');
  const sector = searchParams.get('sector');

  let query = supabase
    .from('trade_flows')
    .select(`
      *,
      source_country:countries!trade_flows_source_country_id_fkey(id, name, code),
      target_country:countries!trade_flows_target_country_id_fkey(id, name, code)
    `)
    .order('year');

  if (year) query = query.eq('year', parseInt(year));
  if (sector) query = query.eq('sector', sector);
  if (country) {
    query = query.or(`source_country_id.eq.${country},target_country_id.eq.${country}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

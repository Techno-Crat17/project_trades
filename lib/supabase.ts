import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Country = {
  id: string;
  name: string;
  code: string;
  gdp: number;
  region: string;
  population: number;
};

export type TradeFlow = {
  id: string;
  source_country_id: string;
  target_country_id: string;
  year: number;
  export_value: number;
  import_value: number;
  sector: string;
  source_country?: Country;
  target_country?: Country;
};

export type Tariff = {
  id: string;
  country_id: string;
  product_category: string;
  tariff_rate: number;
  country?: Country;
};

export type Agreement = {
  id: string;
  name: string;
  country_ids: string[];
  start_date: string;
  end_date: string | null;
  agreement_type: string;
  description: string;
};

export type Trademark = {
  id: string;
  name: string;
  owner: string;
  country_id: string;
  category: string;
  status: string;
  registration_date: string;
  country?: Country;
};

export type AIInsight = {
  country: string;
  risk_score: number;
  opportunities: string[];
  challenges: string[];
  growth_forecast: number;
  trade_balance_trend: 'improving' | 'stable' | 'declining';
};

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, Country, Tariff, Agreement, TradeFlow } from '@/lib/supabase';
import { formatCurrency, formatNumber, COUNTRY_COLORS } from '@/lib/format';
import { Globe as Globe2, Handshake, ChartBar as BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COUNTRY_EMOJIS: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', China: '🇨🇳', Germany: '🇩🇪', Japan: '🇯🇵',
};

function CountriesContent() {
  const searchParams = useSearchParams();
  const initId = searchParams.get('id') ?? '';

  const [countries, setCountries] = React.useState<Country[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>(initId);
  const [tariffs, setTariffs] = React.useState<Tariff[]>([]);
  const [agreements, setAgreements] = React.useState<Agreement[]>([]);
  const [flows, setFlows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [countriesLoading, setCountriesLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.from('countries').select('*').order('name').then(({ data }) => {
      const c = data ?? [];
      setCountries(c);
      if (!selectedId && c.length > 0) setSelectedId(c[0].id);
      setCountriesLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    Promise.all([
      supabase.from('tariffs').select('*').eq('country_id', selectedId).order('product_category'),
      supabase.from('agreements').select('*').contains('country_ids', [selectedId]),
      supabase.from('trade_flows').select('*, source_country:countries!trade_flows_source_country_id_fkey(id,name), target_country:countries!trade_flows_target_country_id_fkey(id,name)')
        .or(`source_country_id.eq.${selectedId},target_country_id.eq.${selectedId}`)
        .eq('year', 2024),
    ]).then(([{ data: t }, { data: a }, { data: f }]) => {
      setTariffs(t ?? []);
      setAgreements(a ?? []);
      setFlows(f ?? []);
      setLoading(false);
    });
  }, [selectedId]);

  const selected = countries.find((c) => c.id === selectedId);

  const totalExports = flows.reduce((s: number, f: any) => {
    if (f.source_country?.id === selectedId) return s + Number(f.export_value);
    return s;
  }, 0);
  const totalImports = flows.reduce((s: number, f: any) => {
    if (f.target_country?.id === selectedId) return s + Number(f.import_value);
    return s;
  }, 0);

  const partnerMap: Record<string, { name: string; exports: number; imports: number }> = {};
  flows.forEach((f: any) => {
    if (f.source_country?.id === selectedId) {
      const name = f.target_country?.name ?? 'Unknown';
      partnerMap[name] = partnerMap[name] ?? { name, exports: 0, imports: 0 };
      partnerMap[name].exports += Number(f.export_value);
    } else {
      const name = f.source_country?.name ?? 'Unknown';
      partnerMap[name] = partnerMap[name] ?? { name, exports: 0, imports: 0 };
      partnerMap[name].imports += Number(f.import_value);
    }
  });
  const partners = Object.values(partnerMap).sort((a, b) => (b.exports + b.imports) - (a.exports + a.imports));

  const radarData = tariffs.map((t) => ({
    category: t.product_category,
    rate: Number(t.tariff_rate),
  }));

  const barData = tariffs.map((t) => ({
    category: t.product_category.slice(0, 8),
    rate: Number(t.tariff_rate),
  }));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Country Profiles</h1>
            <p className="text-muted-foreground mt-1">Trade partners, tariffs, and agreements</p>
          </div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-56"
          >
            {countries.map((c) => <option key={c.id} value={c.id}>{COUNTRY_EMOJIS[c.name] ?? ''} {c.name}</option>)}
          </select>
        </div>

        {/* Country tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {countries.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedId === c.id
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-card text-muted-foreground border-border hover:border-blue-300'
              }`}
              style={selectedId === c.id ? { backgroundColor: COUNTRY_COLORS[c.name] ?? '#3b82f6' } : {}}
            >
              <span>{COUNTRY_EMOJIS[c.name]}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {countriesLoading || !selected ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl border border-border bg-card h-48" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Country overview */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-6xl">{COUNTRY_EMOJIS[selected.name]}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-muted-foreground">{selected.region}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div><div className="text-xs text-muted-foreground">GDP</div><div className="font-bold text-foreground">{formatCurrency(selected.gdp)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Population</div><div className="font-bold text-foreground">{formatNumber(selected.population)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Exports (2024)</div><div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalExports)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Imports (2024)</div><div className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalImports)}</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trade Partners */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe2 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-foreground">Trade Partners</h3>
                </div>
                {loading ? (
                  <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse h-10 rounded bg-muted" />)}</div>
                ) : partners.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No partner data available</p>
                ) : (
                  <div className="space-y-3">
                    {partners.map((p) => (
                      <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{COUNTRY_EMOJIS[p.name] ?? '🌐'}</span>
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end"><TrendingUp className="h-3 w-3" />{formatCurrency(p.exports)}</div>
                          <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-0.5 justify-end"><TrendingDown className="h-3 w-3" />{formatCurrency(p.imports)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tariff Radar */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Tariff Rates (%)</h3>
                </div>
                {loading ? (
                  <div className="animate-pulse h-52 rounded bg-muted" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={65} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Tariff Rate']} />
                      <Bar dataKey="rate" fill={COUNTRY_COLORS[selected.name] ?? '#3b82f6'} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Trade Agreements */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Handshake className="h-5 w-5 text-teal-500" />
                  <h3 className="font-semibold text-foreground">Trade Agreements</h3>
                </div>
                {loading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse h-16 rounded bg-muted" />)}</div>
                ) : agreements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No agreements found</p>
                ) : (
                  <div className="space-y-3">
                    {agreements.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border/50 bg-accent/20 p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-sm text-foreground leading-tight">{a.name}</div>
                          <span className="shrink-0 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{a.agreement_type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">Since {a.start_date?.split('-')[0]}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CountriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <CountriesContent />
    </Suspense>
  );
}

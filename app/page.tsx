'use client';

import * as React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Globe as Globe2, ChartBar as BarChart3, Search, Zap, ArrowRight, Activity } from 'lucide-react';
import { supabase, Country, TradeFlow } from '@/lib/supabase';
import { formatCurrency, COUNTRY_COLORS } from '@/lib/format';

const COUNTRY_EMOJIS: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', China: '🇨🇳', Germany: '🇩🇪', Japan: '🇯🇵',
};

export default function HomePage() {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [flows, setFlows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState('All');

  React.useEffect(() => {
    async function load() {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase
          .from('trade_flows')
          .select('*, source_country:countries!trade_flows_source_country_id_fkey(id,name), target_country:countries!trade_flows_target_country_id_fkey(id,name)')
          .eq('year', 2024),
      ]);
      setCountries(c ?? []);
      setFlows(f ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const countryFlows = selected === 'All'
    ? flows
    : flows.filter((f) => f.source_country?.name === selected || f.target_country?.name === selected);

  const filteredExports = countryFlows.reduce((s: number, f: any) => s + Number(f.export_value), 0);
  const filteredImports = countryFlows.reduce((s: number, f: any) => s + Number(f.import_value), 0);
  const totalExports = flows.reduce((s: number, f: any) => s + Number(f.export_value), 0);
  const totalImports = flows.reduce((s: number, f: any) => s + Number(f.import_value), 0);
  const tradeBalance = totalExports - totalImports;

  const summaryCards = [
    { label: 'Total Exports (2024)', value: formatCurrency(filteredExports), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Total Imports (2024)', value: formatCurrency(filteredImports), icon: TrendingDown, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950' },
    { label: 'Trade Balance', value: formatCurrency(Math.abs(filteredExports - filteredImports)), icon: Activity, color: (filteredExports - filteredImports) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400', bg: (filteredExports - filteredImports) >= 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-amber-50 dark:bg-amber-950' },
    { label: 'Countries Tracked', value: countries.length.toString(), icon: Globe2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950' },
  ];

  const features = [
    { href: '/dashboard', icon: BarChart3, title: 'Trade Dashboard', desc: 'Interactive charts for trade trends and sector comparisons.' },
    { href: '/countries', icon: Globe2, title: 'Country Profiles', desc: 'Deep-dive into trade partners, tariffs, and agreements.' },
    { href: '/trademarks', icon: Search, title: 'Trademark Search', desc: 'Search and filter trademark registrations across 5 countries.' },
    { href: '/insights', icon: Zap, title: 'AI Insights', desc: 'AI-powered risk scores, opportunities, and growth forecasts.' },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            Global Trade Intelligence Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Trade Flows, Simplified
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Analyze bilateral trade data, tariffs, agreements, and AI-powered insights across 5 major economies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-white text-blue-700 px-6 py-3 font-semibold hover:bg-blue-50 transition-colors">
              Explore Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/insights" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold hover:bg-white/20 transition-colors">
              AI Insights <Zap className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Country Filter */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Filter by country:</span>
          {['All', ...countries.map((c) => c.name)].map((name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selected === name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-blue-400'
              }`}
            >
              {name !== 'All' && COUNTRY_EMOJIS[name] ? COUNTRY_EMOJIS[name] + ' ' : ''}{name}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6 h-28" />
              ))
            : summaryCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                  <div className={`rounded-lg p-2 w-fit mb-3 ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{card.value}</div>
                  <div className="text-sm text-muted-foreground">{card.label}</div>
                </div>
              ))}
        </div>

        {/* Country GDP Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Economy Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-border bg-card h-40" />
                ))
              : countries.map((c) => (
                  <Link
                    key={c.id}
                    href={`/countries?id=${c.id}`}
                    className="group rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <div className="text-3xl mb-3">{COUNTRY_EMOJIS[c.name]}</div>
                    <div className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">{c.region}</div>
                    <div className="text-lg font-bold" style={{ color: COUNTRY_COLORS[c.name] ?? '#3b82f6' }}>
                      {formatCurrency(c.gdp)}
                    </div>
                    <div className="text-xs text-muted-foreground">GDP</div>
                  </Link>
                ))}
          </div>
        </div>

        {/* Feature Navigation */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Explore Platform</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 w-fit mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                  <f.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

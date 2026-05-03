'use client';

import * as React from 'react';
import { supabase, Country, TradeFlow } from '@/lib/supabase';
import { formatCurrency, COUNTRY_COLORS, SECTORS, YEARS } from '@/lib/format';
import { Download, Filter } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [flows, setFlows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCountry, setSelectedCountry] = React.useState('all');
  const [selectedSector, setSelectedSector] = React.useState('all');
  const [compareCountry, setCompareCountry] = React.useState('all');

  React.useEffect(() => {
    async function load() {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('trade_flows').select('*, source_country:countries!trade_flows_source_country_id_fkey(id,name), target_country:countries!trade_flows_target_country_id_fkey(id,name)').order('year'),
      ]);
      setCountries(c ?? []);
      setFlows(f ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // Filter flows
  const filtered = flows.filter((f) => {
    const countryMatch = selectedCountry === 'all' || f.source_country?.id === selectedCountry || f.target_country?.id === selectedCountry;
    const sectorMatch = selectedSector === 'all' || f.sector === selectedSector;
    return countryMatch && sectorMatch;
  });

  // Line chart: trade trends by year
  const lineSeries = YEARS.map((year) => {
    const yearFlows = filtered.filter((f) => f.year === year);
    return {
      year,
      Exports: yearFlows.reduce((s: number, f: any) => s + Number(f.export_value), 0) / 1e9,
      Imports: yearFlows.reduce((s: number, f: any) => s + Number(f.import_value), 0) / 1e9,
    };
  });

  // Bar chart: sector comparison for latest year
  const sectorData = SECTORS.map((sector) => {
    const sectorFlows = flows.filter((f) => f.year === 2024 && f.sector === sector);
    const exports = sectorFlows.reduce((s: number, f: any) => s + Number(f.export_value), 0) / 1e9;
    const imports = sectorFlows.reduce((s: number, f: any) => s + Number(f.import_value), 0) / 1e9;
    return { sector: sector.slice(0, 10), Exports: parseFloat(exports.toFixed(1)), Imports: parseFloat(imports.toFixed(1)) };
  }).filter((d) => d.Exports > 0 || d.Imports > 0);

  // Country comparison
  const getCountryTotals = (countryId: string) => {
    if (countryId === 'all') return null;
    const countryFlows = flows.filter((f) => f.source_country?.id === countryId || f.target_country?.id === countryId);
    return YEARS.map((year) => {
      const yf = countryFlows.filter((f: any) => f.year === year);
      return {
        year,
        exports: yf.reduce((s: number, f: any) => s + Number(f.export_value), 0) / 1e9,
        imports: yf.reduce((s: number, f: any) => s + Number(f.import_value), 0) / 1e9,
      };
    });
  };

  const country1Data = getCountryTotals(selectedCountry);
  const country2Data = getCountryTotals(compareCountry);
  const comparisonData = selectedCountry !== 'all' && compareCountry !== 'all'
    ? YEARS.map((year, i) => ({
        year,
        [`${countries.find((c) => c.id === selectedCountry)?.name ?? ''} Exp`]: country1Data?.[i]?.exports.toFixed(1),
        [`${countries.find((c) => c.id === compareCountry)?.name ?? ''} Exp`]: country2Data?.[i]?.exports.toFixed(1),
      }))
    : [];

  function exportCSV() {
    const headers = ['Year', 'Source', 'Target', 'Sector', 'Exports (B)', 'Imports (B)'];
    const rows = filtered.map((f) => [
      f.year, f.source_country?.name, f.target_country?.name, f.sector,
      (Number(f.export_value) / 1e9).toFixed(2), (Number(f.import_value) / 1e9).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trade_data.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trade Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visualize trade flows across countries and sectors</p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Countries</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Sectors</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Compare With</label>
              <select
                value={compareCountry}
                onChange={(e) => setCompareCountry(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Select Country</option>
                {countries.filter((c) => c.id !== selectedCountry).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Trade Trends (2020–2024)</h2>
              <p className="text-xs text-muted-foreground mb-4">Values in USD Billions</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}B`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(1)}B`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="Exports" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Imports" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Sector Comparison (2024)</h2>
              <p className="text-xs text-muted-foreground mb-4">Values in USD Billions</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="sector" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}B`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(1)}B`, '']} />
                  <Legend />
                  <Bar dataKey="Exports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Imports" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Country comparison chart */}
            {comparisonData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-foreground mb-1">Country Exports Comparison</h2>
                <p className="text-xs text-muted-foreground mb-4">Values in USD Billions</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}B`} />
                    <Tooltip formatter={(v: number) => [`$${v}B`, '']} />
                    <Legend />
                    {Object.keys(comparisonData[0] ?? {}).filter((k) => k !== 'year').map((key, i) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={i === 0 ? '#3b82f6' : '#f97316'} strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Summary table */}
            <div className={`rounded-xl border border-border bg-card p-6 ${comparisonData.length === 0 ? 'lg:col-span-2' : ''}`}>
              <h2 className="text-lg font-semibold text-foreground mb-4">Trade Summary Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Year</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Exports</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Imports</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineSeries.map((row) => {
                      const balance = row.Exports - row.Imports;
                      return (
                        <tr key={row.year} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-2 px-3 font-medium">{row.year}</td>
                          <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">${row.Exports.toFixed(1)}B</td>
                          <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400">${row.Imports.toFixed(1)}B</td>
                          <td className={`py-2 px-3 text-right font-medium ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {balance >= 0 ? '+' : ''}{balance.toFixed(1)}B
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

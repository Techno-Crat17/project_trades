'use client';

import * as React from 'react';
import { supabase, Country, Trademark } from '@/lib/supabase';
import { Search, Filter, Download, CircleCheck as CheckCircle2, Clock, X } from 'lucide-react';

const COUNTRY_EMOJIS: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', China: '🇨🇳', Germany: '🇩🇪', Japan: '🇯🇵',
};

const CATEGORIES = ['Technology', 'Pharmaceuticals', 'Automotive', 'Electronics', 'Manufacturing', 'Food & Beverage', 'Agriculture', 'Energy'];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function TrademarksPage() {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [trademarks, setTrademarks] = React.useState<(Trademark & { country?: Country })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  React.useEffect(() => {
    supabase.from('countries').select('*').order('name').then(({ data }) => setCountries(data ?? []));
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    setLoading(true);
    let q = supabase.from('trademarks').select('*, country:countries(id,name,code)').order('name');
    if (debouncedQuery) q = q.ilike('name', `%${debouncedQuery}%`);
    if (selectedCountry !== 'all') q = q.eq('country_id', selectedCountry);
    if (selectedCategory !== 'all') q = q.eq('category', selectedCategory);
    if (selectedStatus !== 'all') q = q.eq('status', selectedStatus);
    q.then(({ data }) => {
      setTrademarks(data ?? []);
      setLoading(false);
    });
  }, [debouncedQuery, selectedCountry, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCountry('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const hasFilters = query || selectedCountry !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all';

  function exportCSV() {
    const headers = ['Name', 'Owner', 'Country', 'Category', 'Status', 'Registration Date'];
    const rows = trademarks.map((t) => [
      t.name, t.owner, (t.country as any)?.name, t.category, t.status, t.registration_date
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'trademarks.csv'; a.click();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trademark Search</h1>
            <p className="text-muted-foreground mt-1">Search registered trademarks across 5 countries</p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Search + Filters */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by trademark name..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters:</span>
            </div>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Countries</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{COUNTRY_EMOJIS[c.name] ?? ''} {c.name}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${trademarks.length} trademark${trademarks.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Trademark grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card h-36" />
            ))}
          </div>
        ) : trademarks.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No trademarks found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trademarks.map((tm) => (
              <div key={tm.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold text-foreground text-sm leading-tight">{tm.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tm.owner}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[tm.status] ?? ''}`}>
                    {tm.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {tm.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    {tm.category}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {COUNTRY_EMOJIS[(tm.country as any)?.name ?? ''] ?? '🌐'} {(tm.country as any)?.name}
                  </span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Registered: {tm.registration_date ? new Date(tm.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

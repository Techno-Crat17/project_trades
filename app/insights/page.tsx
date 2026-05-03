'use client';

import * as React from 'react';
import { mockInsights } from '@/lib/mock-insights';
import { COUNTRY_COLORS } from '@/lib/format';
import { Zap, TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const COUNTRY_EMOJIS: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', China: '🇨🇳', Germany: '🇩🇪', Japan: '🇯🇵',
};

const COUNTRIES = Object.keys(mockInsights);

function RiskGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score < 0.25 ? '#22c55e' : score < 0.4 ? '#f59e0b' : '#ef4444';
  const label = score < 0.25 ? 'Low' : score < 0.4 ? 'Medium' : 'High';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${pct * 2.51} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{pct}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{label} Risk</span>
    </div>
  );
}

const TREND_LABELS: Record<string, string> = {
  improving: 'Improving',
  stable: 'Stable',
  declining: 'Declining',
};

const TREND_STYLES: Record<string, string> = {
  improving: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950',
  stable: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950',
  declining: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950',
};

const TREND_ICONS = {
  improving: TrendingUp,
  stable: TrendingUp,
  declining: TrendingDown,
};

export default function InsightsPage() {
  const [selectedCountry, setSelectedCountry] = React.useState('India');
  const [loading, setLoading] = React.useState(false);
  const [insight, setInsight] = React.useState(mockInsights['India']);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  const refresh = async (country: string) => {
    setLoading(true);
    setSelectedCountry(country);
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    const data = await res.json();
    setInsight(data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  React.useEffect(() => {
    refresh('India');
  }, []);

  const radarData = [
    { axis: 'Market Growth', value: insight.growth_forecast * 10 },
    { axis: 'Trade Balance', value: insight.trade_balance_trend === 'improving' ? 80 : insight.trade_balance_trend === 'stable' ? 60 : 30 },
    { axis: 'Opportunities', value: insight.opportunities.length * 20 },
    { axis: 'Stability', value: Math.round((1 - insight.risk_score) * 100) },
    { axis: 'GDP Strength', value: 70 },
  ];

  const TrendIcon = TREND_ICONS[insight.trade_balance_trend] ?? TrendingUp;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-6 w-6 text-amber-500" />
              <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
            </div>
            <p className="text-muted-foreground">Mock AI predictions and trade intelligence by country</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Country selector tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {COUNTRIES.map((name) => (
            <button
              key={name}
              onClick={() => refresh(name)}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border disabled:opacity-50 ${
                selectedCountry === name
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-card text-muted-foreground border-border hover:border-blue-300'
              }`}
              style={selectedCountry === name ? { backgroundColor: COUNTRY_COLORS[name] ?? '#3b82f6' } : {}}
            >
              {COUNTRY_EMOJIS[name]} {name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`animate-pulse rounded-xl border border-border bg-card h-64 ${i === 3 ? 'lg:col-span-2' : ''}`} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Score */}
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center">
                <h2 className="text-lg font-semibold text-foreground mb-4 self-start">Risk Assessment</h2>
                <RiskGauge score={insight.risk_score} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground">Overall Trade Risk Score</div>
                  <div className="text-xs text-muted-foreground mt-1 italic">Based on geopolitical, economic & market factors</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                    <div>
                      <div className="text-xs text-muted-foreground">GDP Growth Forecast</div>
                      <div className="text-xl font-bold text-foreground">{insight.growth_forecast}%</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-500 opacity-60" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                    <div>
                      <div className="text-xs text-muted-foreground">Trade Balance Trend</div>
                      <div className={`text-sm font-bold flex items-center gap-1 mt-0.5 ${TREND_STYLES[insight.trade_balance_trend]?.split(' ')[0]}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TREND_STYLES[insight.trade_balance_trend]}`}>
                          <TrendIcon className="h-3 w-3" />
                          {TREND_LABELS[insight.trade_balance_trend]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                    <div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                      <div className="text-xl font-bold">{Math.round(insight.risk_score * 100)}/100</div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500 opacity-60" />
                  </div>
                </div>
              </div>

              {/* Radar chart */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Trade Intelligence Radar</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="value" stroke={COUNTRY_COLORS[insight.country] ?? '#3b82f6'} fill={COUNTRY_COLORS[insight.country] ?? '#3b82f6'} fillOpacity={0.3} />
                    <Tooltip formatter={(v: number) => [v, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Opportunities */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold text-foreground">Growth Opportunities</h2>
                </div>
                <div className="space-y-2">
                  {insight.opportunities.map((opp, i) => (
                    <div key={opp} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{opp}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-foreground">Key Challenges</h2>
                </div>
                <div className="space-y-2">
                  {insight.challenges.map((ch, i) => (
                    <div key={ch} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{ch}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => refresh(selectedCountry)}
                  disabled={loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-accent/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Predictions
                </button>
              </div>
            </div>

            {/* All countries comparison */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">All Countries Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Country</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Risk Score</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Growth Forecast</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Trade Trend</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Top Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(mockInsights).map((ins) => {
                      const TIcon = TREND_ICONS[ins.trade_balance_trend];
                      return (
                        <tr key={ins.country} className={`border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer ${selectedCountry === ins.country ? 'bg-accent/30' : ''}`} onClick={() => refresh(ins.country)}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{COUNTRY_EMOJIS[ins.country]}</span>
                              <span className="font-medium text-foreground">{ins.country}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                              ins.risk_score < 0.25 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                              ins.risk_score < 0.4 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {Math.round(ins.risk_score * 100)}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-foreground">{ins.growth_forecast}%</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TREND_STYLES[ins.trade_balance_trend]}`}>
                              <TIcon className="h-3 w-3" />
                              {TREND_LABELS[ins.trade_balance_trend]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{ins.opportunities[0]}</td>
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

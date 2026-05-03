import { AIInsight } from './supabase';

export const mockInsights: Record<string, AIInsight> = {
  India: {
    country: 'India',
    risk_score: 0.28,
    opportunities: ['Renewable Energy', 'IT Services', 'Pharmaceuticals', 'Electronics Manufacturing'],
    challenges: ['Infrastructure Gaps', 'Regulatory Complexity', 'Currency Volatility'],
    growth_forecast: 7.2,
    trade_balance_trend: 'improving',
  },
  'United States': {
    country: 'United States',
    risk_score: 0.18,
    opportunities: ['AI & Cloud Computing', 'Aerospace', 'Biotech', 'LNG Exports'],
    challenges: ['Trade Deficit with China', 'Supply Chain Concentration', 'Inflation Pressure'],
    growth_forecast: 2.4,
    trade_balance_trend: 'stable',
  },
  China: {
    country: 'China',
    risk_score: 0.42,
    opportunities: ['EV Batteries', 'Solar Panels', 'Consumer Electronics', 'Belt & Road Markets'],
    challenges: ['Property Sector Debt', 'US Tariff Escalation', 'Demographic Headwinds'],
    growth_forecast: 4.6,
    trade_balance_trend: 'stable',
  },
  Germany: {
    country: 'Germany',
    risk_score: 0.22,
    opportunities: ['Green Hydrogen', 'Advanced Manufacturing', 'Industrial Automation', 'Medtech'],
    challenges: ['Energy Transition Costs', 'Aging Workforce', 'Automotive Disruption'],
    growth_forecast: 1.1,
    trade_balance_trend: 'declining',
  },
  Japan: {
    country: 'Japan',
    risk_score: 0.19,
    opportunities: ['Robotics', 'Semiconductor Equipment', 'Precision Medicine', 'Hydrogen Fuel Cells'],
    challenges: ['Yen Depreciation', 'Population Decline', 'High Public Debt'],
    growth_forecast: 1.4,
    trade_balance_trend: 'stable',
  },
};

export function getInsight(country: string): AIInsight {
  return mockInsights[country] ?? mockInsights['India'];
}

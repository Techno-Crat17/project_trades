export function formatCurrency(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return value.toLocaleString();
}

export const SECTORS = ['Technology', 'Manufacturing', 'Pharmaceuticals', 'Electronics', 'Automotive', 'Agriculture', 'Energy'];

export const COUNTRY_FLAGS: Record<string, string> = {
  India: 'IN',
  'United States': 'US',
  China: 'CN',
  Germany: 'DE',
  Japan: 'JP',
};

export const COUNTRY_COLORS: Record<string, string> = {
  India: '#f97316',
  'United States': '#3b82f6',
  China: '#ef4444',
  Germany: '#eab308',
  Japan: '#ec4899',
};

export const YEARS = [2020, 2021, 2022, 2023, 2024];

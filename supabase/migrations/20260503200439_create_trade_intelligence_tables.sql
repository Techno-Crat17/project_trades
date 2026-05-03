
/*
  # Trade Intelligence Platform - Initial Schema

  ## New Tables
  1. `countries` - Country profiles with GDP and region
  2. `trade_flows` - Bilateral trade data by year and sector
  3. `tariffs` - Tariff rates by country and product category
  4. `agreements` - Trade agreements with dates
  5. `trademarks` - Trademark registry entries

  ## Security
  - RLS enabled on all tables
  - Public read access for all tables (demo data, no PII)
  - No write access from client

  ## Seed Data
  - 5 countries: India, United States, China, Germany, Japan
  - Trade flows for 2020-2024
  - Tariff data per country
  - Sample trade agreements
  - Sample trademarks
*/

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  gdp numeric NOT NULL DEFAULT 0,
  region text NOT NULL DEFAULT '',
  population numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are publicly readable"
  ON countries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trade flows table
CREATE TABLE IF NOT EXISTS trade_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_country_id uuid NOT NULL REFERENCES countries(id),
  target_country_id uuid NOT NULL REFERENCES countries(id),
  year integer NOT NULL,
  export_value numeric NOT NULL DEFAULT 0,
  import_value numeric NOT NULL DEFAULT 0,
  sector text NOT NULL DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade flows are publicly readable"
  ON trade_flows FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_trade_flows_source ON trade_flows(source_country_id);
CREATE INDEX IF NOT EXISTS idx_trade_flows_target ON trade_flows(target_country_id);
CREATE INDEX IF NOT EXISTS idx_trade_flows_year ON trade_flows(year);

-- Tariffs table
CREATE TABLE IF NOT EXISTS tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES countries(id),
  product_category text NOT NULL,
  tariff_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tariffs are publicly readable"
  ON tariffs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tariffs_country ON tariffs(country_id);

-- Agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_ids uuid[] NOT NULL DEFAULT '{}',
  start_date date,
  end_date date,
  agreement_type text NOT NULL DEFAULT 'FTA',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agreements are publicly readable"
  ON agreements FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trademarks table
CREATE TABLE IF NOT EXISTS trademarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner text NOT NULL,
  country_id uuid NOT NULL REFERENCES countries(id),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  registration_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trademarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trademarks are publicly readable"
  ON trademarks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_trademarks_country ON trademarks(country_id);
CREATE INDEX IF NOT EXISTS idx_trademarks_name ON trademarks(name);

-- =====================
-- SEED DATA
-- =====================

-- Insert countries
INSERT INTO countries (id, name, code, gdp, region, population) VALUES
  ('11111111-1111-1111-1111-111111111111', 'India', 'IN', 3730000000000, 'Asia', 1428000000),
  ('22222222-2222-2222-2222-222222222222', 'United States', 'US', 27360000000000, 'North America', 335000000),
  ('33333333-3333-3333-3333-333333333333', 'China', 'CN', 17700000000000, 'Asia', 1412000000),
  ('44444444-4444-4444-4444-444444444444', 'Germany', 'DE', 4430000000000, 'Europe', 84000000),
  ('55555555-5555-5555-5555-555555555555', 'Japan', 'JP', 4230000000000, 'Asia', 125000000)
ON CONFLICT (name) DO NOTHING;

-- Insert trade flows (India exports)
INSERT INTO trade_flows (source_country_id, target_country_id, year, export_value, import_value, sector) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2020, 51400000000, 29400000000, 'Technology'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2021, 62400000000, 35200000000, 'Technology'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2022, 76900000000, 41500000000, 'Technology'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2023, 82700000000, 43800000000, 'Technology'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2024, 91300000000, 47200000000, 'Technology'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2020, 12800000000, 65300000000, 'Manufacturing'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2021, 13900000000, 72100000000, 'Manufacturing'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2022, 15600000000, 94200000000, 'Manufacturing'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2023, 16800000000, 98700000000, 'Manufacturing'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2024, 18200000000, 101400000000, 'Manufacturing'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2020, 18600000000, 12300000000, 'Pharmaceuticals'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2021, 22400000000, 14100000000, 'Pharmaceuticals'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2022, 27300000000, 16800000000, 'Pharmaceuticals'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2023, 31900000000, 18200000000, 'Pharmaceuticals'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2024, 36700000000, 19800000000, 'Pharmaceuticals'),
  -- US trade flows
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2020, 124500000000, 435400000000, 'Electronics'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2021, 151200000000, 506300000000, 'Electronics'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2022, 153800000000, 536500000000, 'Electronics'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2023, 147600000000, 498200000000, 'Electronics'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2024, 143900000000, 489700000000, 'Electronics'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2020, 65200000000, 114700000000, 'Automotive'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2021, 72800000000, 132400000000, 'Automotive'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2022, 79300000000, 141900000000, 'Automotive'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2023, 83100000000, 148600000000, 'Automotive'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 2024, 87400000000, 156200000000, 'Automotive'),
  -- China trade flows
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2020, 78200000000, 101400000000, 'Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2021, 94600000000, 113200000000, 'Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2022, 112800000000, 124700000000, 'Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2023, 123400000000, 131900000000, 'Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2024, 134700000000, 139200000000, 'Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 2020, 67300000000, 174200000000, 'Electronics'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 2021, 74100000000, 181600000000, 'Electronics'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 2022, 82700000000, 193400000000, 'Electronics'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 2023, 89400000000, 197800000000, 'Electronics'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 2024, 96200000000, 201300000000, 'Electronics'),
  -- Germany trade flows
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2020, 22800000000, 31400000000, 'Automotive'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2021, 26400000000, 36800000000, 'Automotive'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2022, 29700000000, 41200000000, 'Automotive'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2023, 31900000000, 43700000000, 'Automotive'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2024, 34200000000, 46100000000, 'Automotive'),
  -- Agriculture sector
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 2020, 4200000000, 8700000000, 'Agriculture'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 2021, 4900000000, 9400000000, 'Agriculture'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 2022, 5600000000, 10200000000, 'Agriculture'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 2023, 6300000000, 11100000000, 'Agriculture'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 2024, 7100000000, 12000000000, 'Agriculture'),
  -- Energy sector
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2020, 9800000000, 6200000000, 'Energy'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2021, 11400000000, 7300000000, 'Energy'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2022, 14200000000, 9100000000, 'Energy'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2023, 16800000000, 10700000000, 'Energy'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2024, 19300000000, 12400000000, 'Energy');

-- Insert tariffs
INSERT INTO tariffs (country_id, product_category, tariff_rate) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 10.5),
  ('11111111-1111-1111-1111-111111111111', 'Automotive', 25.0),
  ('11111111-1111-1111-1111-111111111111', 'Agriculture', 35.0),
  ('11111111-1111-1111-1111-111111111111', 'Pharmaceuticals', 5.0),
  ('11111111-1111-1111-1111-111111111111', 'Manufacturing', 15.0),
  ('11111111-1111-1111-1111-111111111111', 'Technology', 0.0),
  ('11111111-1111-1111-1111-111111111111', 'Energy', 7.5),
  ('22222222-2222-2222-2222-222222222222', 'Electronics', 2.5),
  ('22222222-2222-2222-2222-222222222222', 'Automotive', 2.5),
  ('22222222-2222-2222-2222-222222222222', 'Agriculture', 5.0),
  ('22222222-2222-2222-2222-222222222222', 'Pharmaceuticals', 0.0),
  ('22222222-2222-2222-2222-222222222222', 'Manufacturing', 3.5),
  ('22222222-2222-2222-2222-222222222222', 'Technology', 0.0),
  ('22222222-2222-2222-2222-222222222222', 'Energy', 0.0),
  ('33333333-3333-3333-3333-333333333333', 'Electronics', 8.0),
  ('33333333-3333-3333-3333-333333333333', 'Automotive', 15.0),
  ('33333333-3333-3333-3333-333333333333', 'Agriculture', 15.5),
  ('33333333-3333-3333-3333-333333333333', 'Pharmaceuticals', 4.0),
  ('33333333-3333-3333-3333-333333333333', 'Manufacturing', 10.0),
  ('33333333-3333-3333-3333-333333333333', 'Technology', 3.5),
  ('33333333-3333-3333-3333-333333333333', 'Energy', 5.0),
  ('44444444-4444-4444-4444-444444444444', 'Electronics', 1.5),
  ('44444444-4444-4444-4444-444444444444', 'Automotive', 6.5),
  ('44444444-4444-4444-4444-444444444444', 'Agriculture', 12.0),
  ('44444444-4444-4444-4444-444444444444', 'Pharmaceuticals', 0.0),
  ('44444444-4444-4444-4444-444444444444', 'Manufacturing', 2.0),
  ('44444444-4444-4444-4444-444444444444', 'Technology', 0.0),
  ('44444444-4444-4444-4444-444444444444', 'Energy', 0.5),
  ('55555555-5555-5555-5555-555555555555', 'Electronics', 0.0),
  ('55555555-5555-5555-5555-555555555555', 'Automotive', 0.0),
  ('55555555-5555-5555-5555-555555555555', 'Agriculture', 26.0),
  ('55555555-5555-5555-5555-555555555555', 'Pharmaceuticals', 0.0),
  ('55555555-5555-5555-5555-555555555555', 'Manufacturing', 3.0),
  ('55555555-5555-5555-5555-555555555555', 'Technology', 0.0),
  ('55555555-5555-5555-5555-555555555555', 'Energy', 3.2);

-- Insert agreements
INSERT INTO agreements (name, country_ids, start_date, end_date, agreement_type, description) VALUES
  ('US-India Trade Partnership', ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid], '2020-01-01', NULL, 'BTA', 'Bilateral trade agreement covering technology and pharmaceuticals sectors'),
  ('China-Japan Economic Framework', ARRAY['33333333-3333-3333-3333-333333333333'::uuid, '55555555-5555-5555-5555-555555555555'::uuid], '2019-06-15', NULL, 'FTA', 'Comprehensive economic partnership focusing on electronics and manufacturing'),
  ('EU-Japan EPA', ARRAY['44444444-4444-4444-4444-444444444444'::uuid, '55555555-5555-5555-5555-555555555555'::uuid], '2019-02-01', NULL, 'EPA', 'Economic partnership agreement covering automotive, agriculture and services'),
  ('US-Japan Trade Agreement', ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid], '2020-01-01', NULL, 'FTA', 'Bilateral trade agreement on agricultural and industrial goods'),
  ('India-Japan CEPA', ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid], '2011-08-01', NULL, 'CEPA', 'Comprehensive economic partnership agreement expanding bilateral trade'),
  ('RCEP', ARRAY['33333333-3333-3333-3333-333333333333'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid], '2022-01-01', NULL, 'RCEP', 'Regional Comprehensive Economic Partnership - largest trade bloc'),
  ('US-Germany Investment Treaty', ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], '2018-03-01', NULL, 'BIT', 'Bilateral investment treaty protecting cross-border investments'),
  ('China-Germany Strategic Partnership', ARRAY['33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], '2014-10-01', NULL, 'SPA', 'Strategic partnership on manufacturing and technology cooperation');

-- Insert trademarks
INSERT INTO trademarks (name, owner, country_id, category, status, registration_date) VALUES
  ('TechVision Pro', 'Infosys Technologies Ltd', '11111111-1111-1111-1111-111111111111', 'Technology', 'Active', '2021-03-15'),
  ('SpiceRoute', 'Tata Consumer Products', '11111111-1111-1111-1111-111111111111', 'Food & Beverage', 'Active', '2019-07-22'),
  ('AyurHealing', 'Himalaya Drug Company', '11111111-1111-1111-1111-111111111111', 'Pharmaceuticals', 'Active', '2020-11-08'),
  ('GreenFarm India', 'ITC Limited', '11111111-1111-1111-1111-111111111111', 'Agriculture', 'Active', '2018-04-30'),
  ('BoltDrive EV', 'Mahindra Electric', '11111111-1111-1111-1111-111111111111', 'Automotive', 'Pending', '2023-01-12'),
  ('SolarMax', 'Adani Solar', '11111111-1111-1111-1111-111111111111', 'Energy', 'Active', '2022-06-18'),
  ('CloudNexus', 'Amazon Web Services', '22222222-2222-2222-2222-222222222222', 'Technology', 'Active', '2018-09-01'),
  ('BioShield', 'Pfizer Inc', '22222222-2222-2222-2222-222222222222', 'Pharmaceuticals', 'Active', '2017-12-14'),
  ('AgroMax Pro', 'Cargill Inc', '22222222-2222-2222-2222-222222222222', 'Agriculture', 'Active', '2019-03-27'),
  ('DriveForce', 'Tesla Inc', '22222222-2222-2222-2222-222222222222', 'Automotive', 'Active', '2016-08-05'),
  ('DataStream AI', 'Microsoft Corporation', '22222222-2222-2222-2222-222222222222', 'Technology', 'Active', '2021-11-20'),
  ('CleanPower Grid', 'NextEra Energy', '22222222-2222-2222-2222-222222222222', 'Energy', 'Active', '2020-05-13'),
  ('SmartSilicon', 'Huawei Technologies', '33333333-3333-3333-3333-333333333333', 'Technology', 'Active', '2019-10-30'),
  ('DragonSteel', 'Baosteel Group', '33333333-3333-3333-3333-333333333333', 'Manufacturing', 'Active', '2018-02-16'),
  ('AquaPure CN', 'China Mengniu Dairy', '33333333-3333-3333-3333-333333333333', 'Food & Beverage', 'Active', '2020-08-22'),
  ('EV Lightning', 'BYD Company', '33333333-3333-3333-3333-333333333333', 'Automotive', 'Active', '2021-04-07'),
  ('SolarPanel Pro', 'LONGi Solar', '33333333-3333-3333-3333-333333333333', 'Energy', 'Active', '2022-01-29'),
  ('PharmaCure CN', 'Sinopharm', '33333333-3333-3333-3333-333333333333', 'Pharmaceuticals', 'Pending', '2023-07-15'),
  ('AutoMaster DE', 'Volkswagen AG', '44444444-4444-4444-4444-444444444444', 'Automotive', 'Active', '2015-06-10'),
  ('ChemPro DE', 'BASF SE', '44444444-4444-4444-4444-444444444444', 'Manufacturing', 'Active', '2017-09-28'),
  ('MediPharma DE', 'Bayer AG', '44444444-4444-4444-4444-444444444444', 'Pharmaceuticals', 'Active', '2016-03-04'),
  ('EcoKraft', 'Siemens AG', '44444444-4444-4444-4444-444444444444', 'Energy', 'Active', '2019-12-17'),
  ('TurboEngine X', 'BMW Group', '44444444-4444-4444-4444-444444444444', 'Automotive', 'Active', '2020-07-21'),
  ('DataLogic DE', 'SAP SE', '44444444-4444-4444-4444-444444444444', 'Technology', 'Active', '2021-02-08'),
  ('TechMaster JP', 'Sony Corporation', '55555555-5555-5555-5555-555555555555', 'Electronics', 'Active', '2016-11-15'),
  ('RoboAuto JP', 'Toyota Motor Corp', '55555555-5555-5555-5555-555555555555', 'Automotive', 'Active', '2018-05-23'),
  ('NanoChip JP', 'Tokyo Electron Ltd', '55555555-5555-5555-5555-555555555555', 'Technology', 'Active', '2020-09-11'),
  ('ZenPharma', 'Takeda Pharmaceutical', '55555555-5555-5555-5555-555555555555', 'Pharmaceuticals', 'Active', '2019-01-30'),
  ('FutureFab JP', 'Panasonic Holdings', '55555555-5555-5555-5555-555555555555', 'Electronics', 'Active', '2021-06-14'),
  ('HydrogenX JP', 'Honda Motor Co', '55555555-5555-5555-5555-555555555555', 'Energy', 'Active', '2022-10-03');

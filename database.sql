-- Drop existing policies first
DROP POLICY IF EXISTS "Users can manage their own data" ON users;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view picks" ON picks;
DROP POLICY IF EXISTS "Authenticated users can insert picks" ON picks;
DROP POLICY IF EXISTS "Users can manage their messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can view odds" ON odds_data;
DROP POLICY IF EXISTS "Authenticated users can insert odds" ON odds_data;
DROP POLICY IF EXISTS "Authenticated users can view scraped picks" ON scraped_picks;
DROP POLICY IF EXISTS "Authenticated users can insert scraped picks" ON scraped_picks;

-- Drop existing tables and types
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS picks CASCADE;
DROP TABLE IF EXISTS odds_data CASCADE;
DROP TABLE IF EXISTS scraped_picks CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS SPORT_TYPE CASCADE;
DROP TYPE IF EXISTS SUBSCRIPTION_PLAN CASCADE;
DROP TYPE IF EXISTS SUBSCRIPTION_STATUS CASCADE;
DROP TYPE IF EXISTS PICK_RESULT CASCADE;
DROP TYPE IF EXISTS PICK_SOURCE CASCADE;
DROP TYPE IF EXISTS CHAT_ROLE CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE SPORT_TYPE AS ENUM ('NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF');
CREATE TYPE SUBSCRIPTION_PLAN AS ENUM ('free', 'basic', 'unlimited');
CREATE TYPE SUBSCRIPTION_STATUS AS ENUM ('active', 'inactive', 'cancelled');
CREATE TYPE PICK_RESULT AS ENUM ('win', 'loss', 'pending');
CREATE TYPE PICK_SOURCE AS ENUM ('odds_api', 'scraper');
CREATE TYPE CHAT_ROLE AS ENUM ('user', 'assistant');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan SUBSCRIPTION_PLAN NOT NULL DEFAULT 'free',
  status SUBSCRIPTION_STATUS NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW() + INTERVAL '1 year'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create picks table
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport SPORT_TYPE NOT NULL,
  event TEXT NOT NULL,
  prediction TEXT NOT NULL,
  odds DECIMAL,
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
  result PICK_RESULT DEFAULT 'pending',
  source PICK_SOURCE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pick_id UUID REFERENCES picks(id) ON DELETE SET NULL,
  role CHAT_ROLE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create odds_data table
CREATE TABLE odds_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport SPORT_TYPE NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  commence_time TIMESTAMP WITH TIME ZONE NOT NULL,
  odds_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create scraped_picks table
CREATE TABLE scraped_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT NOT NULL,
  sport SPORT_TYPE NOT NULL,
  event TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence TEXT,
  analysis TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_picks_created_at ON picks(created_at);
CREATE INDEX idx_picks_user_id ON picks(user_id);
CREATE INDEX idx_odds_data_sport ON odds_data(sport);
CREATE INDEX idx_scraped_picks_created_at ON scraped_picks(created_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_picks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON picks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON odds_data FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON scraped_picks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert test user and related data
DO $$
BEGIN
  -- Insert test user if not exists
  INSERT INTO users (id)
  VALUES ('a22d498e-fd28-49f9-a9c6-7e4c642d36f5')
  ON CONFLICT (id) DO NOTHING;

  -- Insert test user profile
  INSERT INTO user_profiles (user_id, first_name, last_name, email, phone_number)
  VALUES (
    'a22d498e-fd28-49f9-a9c6-7e4c642d36f5',
    'Test',
    'User',
    'test@wagergenie.com',
    '+1234567890'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone_number = EXCLUDED.phone_number,
      updated_at = TIMEZONE('utc', NOW());

  -- Insert or update test subscription
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    'a22d498e-fd28-49f9-a9c6-7e4c642d36f5',
    'free',
    'active',
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW() + INTERVAL '1 year')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = TIMEZONE('utc', NOW());
END $$; 
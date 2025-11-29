-- Supabase SQL: Create subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT UNIQUE,
  tier TEXT DEFAULT 'free', -- 'free' or 'premium'
  status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'canceled'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for quick lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_customer ON subscriptions(paddle_customer_id);

-- Add subscription tier to signals table for premium features
ALTER TABLE signals ADD COLUMN IF NOT EXISTS require_premium BOOLEAN DEFAULT FALSE;

-- Update signals table with premium_only column
ALTER TABLE signals ADD COLUMN IF NOT EXISTS is_premium_signal BOOLEAN DEFAULT FALSE;

-- RLS Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to insert/update (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  USING (auth.role() = 'service_role');

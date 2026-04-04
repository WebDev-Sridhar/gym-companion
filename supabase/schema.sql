-- ============================================
-- The BEST Beginner Gym Companion
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Profiles Table
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  height NUMERIC,
  weight NUMERIC,
  gender TEXT CHECK (gender IN ('male', 'female')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'veryActive')),
  goal TEXT CHECK (goal IN ('weightLoss', 'muscleGain', 'maintenance')),
  workout_days INTEGER DEFAULT 3,
  workout_duration INTEGER DEFAULT 60,
  diet_type TEXT CHECK (diet_type IN ('veg', 'nonVeg')),
  use_supplements BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Workout Plans Table
-- ============================================
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  split_name TEXT,
  split_key TEXT,
  level TEXT,
  days_per_week INTEGER,
  schedule JSONB,
  tips JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Exercise Logs Table
-- ============================================
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_name TEXT,
  exercises JSONB NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Diet Plans Table
-- ============================================
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calorie_target INTEGER,
  calorie_tier INTEGER,
  meals JSONB,
  supplements JSONB,
  total_calories INTEGER,
  total_protein INTEGER,
  macros JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Progress (Weight) Tracking Table
-- ============================================
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC,
  body_fat_percentage NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Gamification Table
-- ============================================
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  earned_badges JSONB DEFAULT '[]'::jsonb,
  last_login_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security Policies
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own workout plans" ON workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise logs" ON exercise_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise logs" ON exercise_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diet plans" ON diet_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diet plans" ON diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own gamification" ON gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON gamification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON gamification FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_exercise_logs_user_date ON exercise_logs(user_id, date);
CREATE INDEX idx_progress_user_date ON progress(user_id, date);
CREATE INDEX idx_gamification_user ON gamification(user_id);

-- ============================================
-- Food Logs Table
-- ============================================
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'midMorning', 'lunch', 'evening', 'dinner', 'snack')),
  items JSONB NOT NULL,
  total_calories INTEGER,
  total_protein INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own food logs" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, date);

-- ============================================
-- Subscriptions Table (Razorpay Payments)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'expired', 'cancelled')) DEFAULT 'pending',
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own subscriptions (order creation)
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own subscriptions (payment verification, cancellation)
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_order ON subscriptions(razorpay_order_id);

-- Delete policy for reset
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- XP Logs Table (for leaderboard tracking)
-- ============================================
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  xp_earned INTEGER NOT NULL,
  source TEXT CHECK (source IN ('workout', 'diet', 'weight', 'login', 'streak_bonus')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp_logs" ON xp_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp_logs" ON xp_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_xp_logs_user_created ON xp_logs(user_id, created_at);
CREATE INDEX idx_xp_logs_created ON xp_logs(created_at);

-- ============================================
-- Weekly Rewards Table (leaderboard rewards)
-- ============================================
CREATE TABLE weekly_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  rank INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weekly_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weekly_rewards" ON weekly_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_weekly_rewards_user ON weekly_rewards(user_id);
CREATE INDEX idx_weekly_rewards_week ON weekly_rewards(week_start);
CREATE UNIQUE INDEX idx_weekly_rewards_unique ON weekly_rewards(user_id, week_start);

-- ============================================
-- Leaderboard RPC Functions (SECURITY DEFINER)
-- ============================================

-- Weekly Leaderboard: XP earned in last 7 days
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  xp_earned BIGINT,
  total_xp INTEGER,
  current_streak INTEGER,
  level INTEGER,
  rank BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.user_id,
    COALESCE(p.name, 'Anonymous')::TEXT AS display_name,
    COALESCE(SUM(xl.xp_earned), 0)::BIGINT AS xp_earned,
    g.xp AS total_xp,
    g.current_streak,
    g.level,
    ROW_NUMBER() OVER (
      ORDER BY COALESCE(SUM(xl.xp_earned), 0) DESC,
               g.current_streak DESC,
               g.updated_at ASC,
               g.user_id ASC
    )::BIGINT AS rank
  FROM gamification g
  JOIN profiles p ON p.user_id = g.user_id AND p.name IS NOT NULL
  LEFT JOIN xp_logs xl ON xl.user_id = g.user_id
    AND xl.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY g.user_id, p.name, g.xp, g.current_streak, g.level, g.updated_at
  HAVING COALESCE(SUM(xl.xp_earned), 0) > 0
  ORDER BY xp_earned DESC, g.current_streak DESC, g.updated_at ASC, g.user_id ASC
  LIMIT p_limit;
END;
$$;

-- All-Time Leaderboard: Total XP
CREATE OR REPLACE FUNCTION get_alltime_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  total_xp INTEGER,
  current_streak INTEGER,
  level INTEGER,
  rank BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.user_id,
    COALESCE(p.name, 'Anonymous')::TEXT AS display_name,
    g.xp AS total_xp,
    g.current_streak,
    g.level,
    ROW_NUMBER() OVER (
      ORDER BY g.xp DESC,
               g.current_streak DESC,
               g.updated_at ASC,
               g.user_id ASC
    )::BIGINT AS rank
  FROM gamification g
  JOIN profiles p ON p.user_id = g.user_id AND p.name IS NOT NULL
  WHERE g.xp > 0
  ORDER BY g.xp DESC, g.current_streak DESC, g.updated_at ASC, g.user_id ASC
  LIMIT p_limit;
END;
$$;

-- Streak Leaderboard: Current streak
CREATE OR REPLACE FUNCTION get_streak_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  current_streak INTEGER,
  total_xp INTEGER,
  level INTEGER,
  rank BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.user_id,
    COALESCE(p.name, 'Anonymous')::TEXT AS display_name,
    g.current_streak,
    g.xp AS total_xp,
    g.level,
    ROW_NUMBER() OVER (
      ORDER BY g.current_streak DESC,
               g.xp DESC,
               g.updated_at ASC,
               g.user_id ASC
    )::BIGINT AS rank
  FROM gamification g
  JOIN profiles p ON p.user_id = g.user_id AND p.name IS NOT NULL
  WHERE g.current_streak > 0
  ORDER BY g.current_streak DESC, g.xp DESC, g.updated_at ASC, g.user_id ASC
  LIMIT p_limit;
END;
$$;

-- Process Weekly Rewards (called by edge function)
CREATE OR REPLACE FUNCTION process_weekly_rewards(p_week_start DATE, p_week_end DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  reward_amounts INTEGER[] := ARRAY[50, 40, 30, 20, 10];
  r RECORD;
  i INTEGER := 0;
BEGIN
  -- Idempotency: skip if already processed for this week
  IF EXISTS (SELECT 1 FROM weekly_rewards WHERE week_start = p_week_start LIMIT 1) THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT
      xl.user_id,
      SUM(xl.xp_earned)::INTEGER AS weekly_xp,
      g.current_streak,
      g.updated_at
    FROM xp_logs xl
    JOIN profiles p ON p.user_id = xl.user_id AND p.name IS NOT NULL
    JOIN gamification g ON g.user_id = xl.user_id
    WHERE xl.created_at >= p_week_start::TIMESTAMPTZ
      AND xl.created_at < (p_week_end + 1)::TIMESTAMPTZ
    GROUP BY xl.user_id, g.current_streak, g.updated_at
    HAVING SUM(xl.xp_earned) >= 300
    ORDER BY SUM(xl.xp_earned) DESC, g.current_streak DESC, g.updated_at ASC, xl.user_id ASC
    LIMIT 5
  LOOP
    i := i + 1;

    INSERT INTO weekly_rewards (user_id, week_start, week_end, rank, xp_earned, points_awarded)
    VALUES (r.user_id, p_week_start, p_week_end, i, r.weekly_xp, reward_amounts[i]);

    UPDATE profiles
    SET reward_points = COALESCE(reward_points, 0) + reward_amounts[i],
        updated_at = NOW()
    WHERE user_id = r.user_id;
  END LOOP;
END;
$$;

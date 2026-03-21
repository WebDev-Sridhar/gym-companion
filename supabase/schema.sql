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

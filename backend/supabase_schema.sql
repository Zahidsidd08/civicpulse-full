-- ==============================================================
-- Civic Pulse - Supabase PostgreSQL Schema & Security Policies
-- ==============================================================

-- 1. Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pothole', 'drainage', 'leakage')),
    area VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    status VARCHAR(30) DEFAULT 'Reported' CHECK (status IN ('Reported', 'In progress', 'Fixed')),
    description TEXT,
    photo_url TEXT,
    upvotes INTEGER DEFAULT 1,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    urgency_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Public access policies (for civic reporting transparency)
CREATE POLICY "Allow public read access" 
ON reports FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert reports" 
ON reports FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public status and upvote updates" 
ON reports FOR UPDATE 
USING (true);

-- Grant table permissions to anon and authenticated roles
GRANT ALL ON TABLE public.reports TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Seed initial benchmark data (Mumbai metro area)
INSERT INTO reports (type, area, lat, lng, status, description, upvotes, severity, urgency_score)
VALUES
  ('pothole', 'Andheri', 19.1197, 72.8468, 'Reported', 'Large pothole near metro pillar 42, dangerous for bikes', 14, 'high', 78),
  ('drainage', 'Andheri', 19.1136, 72.8697, 'Reported', 'Clogged storm drain with plastic waste, road flooding', 9, 'high', 72),
  ('leakage', 'Andheri', 19.1075, 72.8263, 'In progress', 'Continuous water pipeline leakage soaking road sub-base', 19, 'critical', 88),
  ('pothole', 'Andheri', 19.1180, 72.8550, 'Fixed', 'Repaired by asphalt patching unit', 22, 'medium', 50),
  ('pothole', 'Bandra', 19.0596, 72.8295, 'Fixed', 'Repaired road surface near Linking road', 31, 'medium', 45),
  ('leakage', 'Bandra', 19.0544, 72.8402, 'Fixed', 'Pipe valve replaced', 15, 'high', 68),
  ('pothole', 'Bandra', 19.0650, 72.8350, 'Reported', 'Cavity near Turner Road', 8, 'high', 76),
  ('drainage', 'Dadar', 19.0178, 72.8478, 'Fixed', 'Storm drain desilted', 40, 'medium', 55),
  ('leakage', 'Dadar', 19.0220, 72.8430, 'Reported', 'Drinking water pipeline oozing', 11, 'medium', 58),
  ('pothole', 'Dadar', 19.0130, 72.8420, 'In progress', 'Road work underway', 6, 'medium', 48),
  ('drainage', 'Kurla', 19.0726, 72.8845, 'Reported', 'Overflowing open drain near station west', 27, 'critical', 92),
  ('pothole', 'Kurla', 19.0690, 72.8790, 'Reported', 'Cluster of potholes from water accumulation', 25, 'critical', 85),
  ('drainage', 'Kurla', 19.0760, 72.8900, 'In progress', 'Culvert cleaning work underway', 13, 'high', 70),
  ('pothole', 'Borivali', 19.2307, 72.8567, 'Fixed', 'SV road junction potholes covered', 18, 'low', 35),
  ('drainage', 'Borivali', 19.2250, 72.8600, 'Fixed', 'Drain line flushed and clear', 21, 'medium', 42);

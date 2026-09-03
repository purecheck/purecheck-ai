-- FreshScan AI — Local Dev Seed Data
-- Applied automatically after migrations by: supabase db reset

INSERT INTO public.vendors (name, address, lat, lng, trust_score, avg_freshness_score, vendor_count, total_scans)
VALUES
  ('Mullakkal Market',              'Mullakkal, Alappuzha, Kerala',       9.4942, 76.3358, 95.0, 95, 38, 342),
  ('Alappuzha Canal Bazaar',        'Canal Bazaar, Alappuzha, Kerala',    9.4920, 76.3325, 92.0, 92, 45, 289),
  ('Kalarcode Produce Market',      'Kalarcode, Alappuzha, Kerala',       9.4678, 76.3450, 88.0, 88, 29, 198),
  ('Thottappally Harbour Market',   'Thottappally, Alappuzha, Kerala',    9.3175, 76.3860, 90.0, 90, 52, 211),
  ('Cherthala Town Market',         'Cherthala, Alappuzha, Kerala',       9.6850, 76.3310, 84.0, 84, 31, 167),
  ('Ambalappuzha Market',           'Ambalappuzha, Alappuzha, Kerala',    9.3820, 76.3680, 89.0, 89, 24, 156),
  ('Haripad Fish & Produce Market', 'Haripad, Alappuzha, Kerala',         9.2840, 76.4520, 79.0, 79, 20, 113),
  ('Kayamkulam Central Bazaar',     'Kayamkulam, Alappuzha, Kerala',      9.1720, 76.5010, 86.0, 86, 41, 248)
ON CONFLICT DO NOTHING;

-- Insert DEV bypass user so local scans don't fail foreign key constraints
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '977a222c-53a1-5f37-a984-b1c98ae18bff',
  'authenticated',
  'authenticated',
  'dev@freshscan.local',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name": "Dev Tester"}',
  false
) ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, email, full_name)
VALUES ('977a222c-53a1-5f37-a984-b1c98ae18bff', 'dev@freshscan.local', 'Dev Tester')
ON CONFLICT DO NOTHING;

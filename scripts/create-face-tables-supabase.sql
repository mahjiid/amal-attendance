-- Create Supabase tables for face recognition data
-- Run this in Supabase SQL Editor

-- 1. Employee Photos Table (stores face descriptors)
CREATE TABLE IF NOT EXISTS employee_photos (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  employee_email TEXT NOT NULL,
  face_descriptor JSONB NOT NULL, -- Store 128-number array as JSON
  photo_thumbnail TEXT, -- Base64 thumbnail (optional)
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_employee_photos_employee_id ON employee_photos(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_photos_email ON employee_photos(employee_email);

-- Ensure only one primary photo per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_employee_photos_primary 
ON employee_photos(employee_id) 
WHERE is_primary = true;

-- 2. Attendance Verification Table
CREATE TABLE IF NOT EXISTS attendance_verification (
  id BIGSERIAL PRIMARY KEY,
  attendance_log_id BIGINT REFERENCES attendance_logs(id) ON DELETE CASCADE,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('face', 'manual_override', 'failed')),
  confidence_score NUMERIC(5,2),
  face_match BOOLEAN,
  ip_address TEXT,
  device_info TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_verification_log ON attendance_verification(attendance_log_id);
CREATE INDEX IF NOT EXISTS idx_attendance_verification_employee ON attendance_verification(employee_id);

-- 3. Fraud Alerts Table
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  employee_email TEXT NOT NULL,
  attendance_log_id BIGINT REFERENCES attendance_logs(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('face_mismatch', 'no_face_detected', 'multiple_faces', 'low_confidence', 'no_photo_enrolled', 'suspicious_pattern')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_employee ON fraud_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_resolved ON fraud_alerts(is_resolved, severity, created_at DESC);

-- Success message
SELECT 'Face recognition tables created successfully!' as message;

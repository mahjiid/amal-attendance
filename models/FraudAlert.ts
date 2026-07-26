import mongoose from 'mongoose';

const FraudAlertSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
    index: true,
  },
  employee_email: {
    type: String,
    required: true,
  },
  attendance_log_id: {
    type: Number,
    required: false,
  },
  alert_type: {
    type: String,
    enum: [
      'face_mismatch',
      'no_face_detected',
      'multiple_faces',
      'low_confidence',
      'no_photo_enrolled',
      'suspicious_pattern'
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: {
    type: String,
    required: true,
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  verification_photo_base64: {
    type: String, // Store the failed verification photo for review
  },
  is_resolved: {
    type: Boolean,
    default: false,
    index: true,
  },
  resolved_by: {
    type: String, // Admin email who resolved
  },
  resolved_at: {
    type: Date,
  },
  resolution_notes: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  }
});

// Compound indexes for common queries
FraudAlertSchema.index({ employee_id: 1, created_at: -1 });
FraudAlertSchema.index({ is_resolved: 1, severity: -1, created_at: -1 });

export const FraudAlert = mongoose.models.FraudAlert || mongoose.model('FraudAlert', FraudAlertSchema);

import mongoose from 'mongoose';

const AttendanceVerificationSchema = new mongoose.Schema({
  attendance_log_id: {
    type: Number,
    required: true,
    index: true,
  },
  employee_id: {
    type: Number,
    required: true,
    index: true,
  },
  verification_type: {
    type: String,
    enum: ['face', 'manual_override', 'failed'],
    required: true,
  },
  verification_photo_base64: {
    type: String,
    required: false, // Temporary storage, auto-deleted after 7 days
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    required: function() {
      return this.verification_type === 'face';
    }
  },
  face_match: {
    type: Boolean,
    required: function() {
      return this.verification_type === 'face';
    }
  },
  ip_address: {
    type: String,
  },
  device_info: {
    type: String,
  },
  failure_reason: {
    type: String,
  },
  expires_at: {
    type: Date,
    default: function() {
      // Auto-expire verification photos after 7 days
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  }
});

// Index for cleanup queries
AttendanceVerificationSchema.index({ expires_at: 1 });

export const AttendanceVerification = mongoose.models.AttendanceVerification || mongoose.model('AttendanceVerification', AttendanceVerificationSchema);

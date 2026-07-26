import mongoose from 'mongoose';

const EmployeePhotoSchema = new mongoose.Schema({
  employee_id: {
    type: Number,
    required: true,
    index: true,
  },
  employee_email: {
    type: String,
    required: true,
    index: true,
  },
  face_descriptor: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 128;
      },
      message: 'Face descriptor must have exactly 128 values'
    }
  },
  photo_thumbnail_base64: {
    type: String,
    required: false, // Optional small thumbnail for admin view
  },
  is_primary: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
});

// Update timestamp on save
EmployeePhotoSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Ensure only one primary photo per employee
EmployeePhotoSchema.index({ employee_id: 1, is_primary: 1 }, { unique: true, partialFilterExpression: { is_primary: true } });

export const EmployeePhoto = mongoose.models.EmployeePhoto || mongoose.model('EmployeePhoto', EmployeePhotoSchema);

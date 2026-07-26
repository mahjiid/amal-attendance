import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const {
      employee_id,
      employee_email,
      captured_descriptor,
      attendance_log_id,
    } = await request.json();

    if (!employee_id || !employee_email || !captured_descriptor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const db = await getDatabase();
    const collection = db.collection('face_enrollments');

    // 1. Get stored face descriptor from MongoDB
    const storedPhoto = await collection.findOne({ employee_id: parseInt(employee_id), is_primary: true });

    if (!storedPhoto) {
      // Create fraud alert for no enrolled photo
      await supabase.from('fraud_alerts').insert({
        employee_id: parseInt(employee_id),
        employee_email,
        attendance_log_id,
        alert_type: 'no_photo_enrolled',
        severity: 'high',
        description: `Employee ${employee_email} attempted check-in without enrolled photo`,
      });

      return NextResponse.json({
        success: false,
        verified: false,
        error: 'No photo enrolled for this employee',
        confidence: 0,
      });
    }

    // 2. Compare face descriptors
    const storedDescriptor = storedPhoto.face_descriptor;
    const distance = euclideanDistance(
      new Float32Array(storedDescriptor),
      new Float32Array(captured_descriptor)
    );

    // Convert to confidence percentage
    const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
    const threshold = 70; // 70% confidence required (lowered for better acceptance)
    const verified = confidence >= threshold;

    // 3. Log verification attempt
    if (attendance_log_id) {
      await supabase.from('attendance_verification').insert({
        attendance_log_id,
        employee_id: parseInt(employee_id),
        verification_type: verified ? 'face' : 'failed',
        confidence_score: confidence,
        face_match: verified,
        failure_reason: verified ? null : 'Low confidence score',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        device_info: request.headers.get('user-agent') || 'unknown',
      });
    }

    // 4. Create fraud alert if verification failed
    if (!verified) {
      const alertType = confidence < 50 ? 'face_mismatch' : 'low_confidence';
      const severity = confidence < 50 ? 'high' : 'medium';

      await supabase.from('fraud_alerts').insert({
        employee_id: parseInt(employee_id),
        employee_email,
        attendance_log_id,
        alert_type: alertType,
        severity,
        description: `Face verification failed with ${confidence.toFixed(1)}% confidence`,
        confidence_score: confidence,
      });
    }

    return NextResponse.json({
      success: true,
      verified,
      confidence: Math.round(confidence),
      message: verified
        ? 'Face verified successfully'
        : `Verification failed. Confidence: ${confidence.toFixed(1)}%`,
    });

  } catch (error: any) {
    console.error('Face verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate Euclidean distance between two descriptors
function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

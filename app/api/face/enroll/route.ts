import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { employee_id, employee_email, face_descriptor, photo_thumbnail_base64 } = await request.json();

    if (!employee_id || !employee_email || !face_descriptor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate face descriptor
    if (!Array.isArray(face_descriptor) || face_descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid face descriptor. Must be array of 128 numbers.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('face_enrollments');

    const filter = { employee_id: parseInt(employee_id) };
    const update = {
      $set: {
        employee_id: parseInt(employee_id),
        employee_email,
        face_descriptor,
        photo_thumbnail: photo_thumbnail_base64,
        is_primary: true,
        updated_at: new Date()
      },
      $setOnInsert: {
        created_at: new Date()
      }
    };

    const result = await collection.updateOne(filter, update, { upsert: true });

    return NextResponse.json({
      success: true,
      message: result.upsertedCount > 0 ? 'Photo enrolled successfully' : 'Photo updated successfully',
      created: result.upsertedCount > 0,
      updated: result.modifiedCount > 0,
    });

  } catch (error: any) {
    console.error('Photo enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll photo', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get('employee_id');
    const employee_email = searchParams.get('employee_email');

    if (!employee_id && !employee_email) {
      return NextResponse.json(
        { error: 'employee_id or employee_email required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('face_enrollments');

    const query: any = { is_primary: true };
    if (employee_id) {
      query.employee_id = parseInt(employee_id);
    } else if (employee_email) {
      query.employee_email = employee_email;
    }

    const photo = await collection.findOne(query);

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo found for this employee' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      has_photo: true,
      face_descriptor: photo.face_descriptor,
      created_at: photo.created_at,
    });

  } catch (error: any) {
    console.error('Get photo error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve photo', details: error.message },
      { status: 500 }
    );
  }
}

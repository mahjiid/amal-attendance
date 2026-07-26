"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WebcamCapture } from '@/components/ui/webcam-capture';
import { Loader2, Upload, CheckCircle2, XCircle, Camera, Users } from 'lucide-react';
import * as faceapi from 'face-api.js';

export default function PhotoEnrollmentPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'capture' | 'processing' | 'success' | 'error'>('select');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const supabase = createClient();

  // Load Face-API.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Use CDN instead of local files
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load models:', err);
        setMessage('Failed to load face detection models');
      }
    };

    loadModels();
  }, []);

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (data) setEmployees(data);
    };

    loadEmployees();
  }, []);

  const handlePhotoCapture = async (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    setStep('processing');

    try {
      // Convert base64 to image
      const img = new Image();
      img.src = photoDataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect face and extract descriptor
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage('No face detected. Please ensure face is clearly visible.');
        setStep('error');
        return;
      }

      // Save to MongoDB
      const response = await fetch('/api/face/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          employee_email: selectedEmployee.email,
          face_descriptor: Array.from(detection.descriptor),
          photo_thumbnail_base64: photoDataUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enroll photo');
      }

      setMessage(`Photo enrolled successfully for ${selectedEmployee.name}!`);
      setStep('success');

      // Reset after 3 seconds
      setTimeout(() => {
        setSelectedEmployee(null);
        setCapturedPhoto(null);
        setStep('select');
        setMessage('');
      }, 3000);

    } catch (err: any) {
      console.error('Enrollment error:', err);
      setMessage(err.message || 'Failed to enroll photo');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setCapturedPhoto(null);
    setStep('capture');
    setMessage('');
  };

  if (!modelsLoaded) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading face detection models...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Photo Enrollment</h1>
        <p className="text-muted-foreground">Enroll employee photos for face verification</p>
      </div>

      {step === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Employee
            </CardTitle>
            <CardDescription>Choose an employee to enroll their photo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {employees.map((employee) => (
                <Button
                  key={employee.id}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setStep('capture');
                  }}
                >
                  <div className="text-left">
                    <div className="font-semibold">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.staff_id} • {employee.email}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'capture' && selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Capture Photo: {selectedEmployee.name}
            </CardTitle>
            <CardDescription>
              Position your face in the center and ensure good lighting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WebcamCapture
              onCapture={handlePhotoCapture}
              showFaceDetection={true}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEmployee(null);
                setStep('select');
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Photo...</h3>
            <p className="text-sm text-muted-foreground">Extracting face data</p>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card className="border-2 border-green-500">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Success!</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      )}

      {step === 'error' && (
        <Card className="border-2 border-red-500">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            <div className="flex gap-2">
              <Button onClick={handleRetry}>Try Again</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(null);
                  setStep('select');
                  setMessage('');
                }}
              >
                Back to List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

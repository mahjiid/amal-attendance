"use client";
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { WebcamCapture } from '@/components/ui/webcam-capture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Camera, AlertTriangle } from 'lucide-react';

interface FaceVerificationProps {
  employeeId: number;
  employeeEmail: string;
  attendanceLogId?: number;
  onVerified: (verified: boolean, confidence: number) => void;
  onCancel?: () => void;
}

export function FaceVerification({
  employeeId,
  employeeEmail,
  attendanceLogId,
  onVerified,
  onCancel
}: FaceVerificationProps) {
  const [step, setStep] = useState<'loading' | 'capture' | 'verifying' | 'result'>('loading');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setStep('capture');
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load face detection models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  const handlePhotoCapture = async (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    setStep('verifying');
    setError(null);

    try {
      // Convert base64 to image element
      const img = new Image();
      img.src = photoDataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect face and get descriptor
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please ensure your face is clearly visible and try again.');
        setStep('capture');
        setCapturedPhoto(null);
        return;
      }

      // Send to verification API
      const response = await fetch('/api/face/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          employee_email: employeeEmail,
          captured_descriptor: Array.from(detection.descriptor),
          attendance_log_id: attendanceLogId,
          verification_photo_base64: photoDataUrl,
        }),
      });

      const result = await response.json();

      setVerificationResult({
        verified: result.verified,
        confidence: result.confidence,
        message: result.message,
      });
      setStep('result');

      // Call callback after 2 seconds
      setTimeout(() => {
        onVerified(result.verified, result.confidence);
      }, 2000);

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      setStep('capture');
      setCapturedPhoto(null);
    }
  };

  const handleRetry = () => {
    setCapturedPhoto(null);
    setVerificationResult(null);
    setError(null);
    setStep('capture');
  };

  if (step === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading face detection models...</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'capture') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Face Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <WebcamCapture
            onCapture={handlePhotoCapture}
            showFaceDetection={true}
          />

          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'verifying') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Verifying Face...</h3>
          <p className="text-sm text-muted-foreground text-center">
            Comparing with enrolled photo
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'result' && verificationResult) {
    return (
      <Card className={`w-full max-w-md mx-auto border-2 ${
        verificationResult.verified ? 'border-green-500' : 'border-red-500'
      }`}>
        <CardContent className="flex flex-col items-center justify-center p-8">
          {verificationResult.verified ? (
            <>
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Verified!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Confidence: {verificationResult.confidence}%
              </p>
            </>
          ) : (
            <>
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {verificationResult.message}
              </p>
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WebcamCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel?: () => void;
  showFaceDetection?: boolean;
}

export function WebcamCapture({ onCapture, onCancel, showFaceDetection = false }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(imageBase64);
  };

  const retake = () => {
    setCaptured(null);
    setFaceDetected(false);
  };

  const confirmCapture = () => {
    if (captured) {
      onCapture(captured);
      stopCamera();
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-red-500/20">
              <div className="text-center space-y-2">
                <CameraOff className="h-12 w-12 mx-auto" />
                <p className="text-sm">{error}</p>
                <Button onClick={startCamera} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain mirror"
              />
              
              {/* Face Detection Overlay */}
              {showFaceDetection && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-64 h-80 border-4 rounded-lg transition-colors ${
                    faceDetected ? 'border-green-500' : 'border-white/50'
                  }`}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                      {faceDetected ? '✓ Face Detected' : 'Position your face'}
                    </div>
                  </div>
                </div>
              )}

              {/* Scanning Line Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-0.5 bg-primary/60 shadow-[0_0_10px_rgba(59,130,246,0.8)] absolute animate-[scan_2s_linear_infinite]" />
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Instructions */}
        {!captured && !error && (
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium">📸 Position your face in the frame</p>
            <p>• Look directly at the camera</p>
            <p>• Ensure good lighting</p>
            <p>• Remove glasses if possible</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {captured ? (
            <>
              <Button onClick={retake} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={confirmCapture} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Use This Photo
              </Button>
            </>
          ) : (
            <>
              {onCancel && (
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              )}
              <Button 
                onClick={capturePhoto} 
                disabled={!!error}
                className="flex-1 bg-primary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
        
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </Card>
  );
}

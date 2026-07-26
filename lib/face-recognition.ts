import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load Face-API.js models from public directory
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('✅ Face-API.js models loaded successfully');
  } catch (error) {
    console.error('❌ Error loading Face-API.js models:', error);
    throw error;
  }
}

/**
 * Detect face in image and extract descriptor
 * @param imageElement - HTML Image or Video element
 * @returns Face descriptor (array of 128 numbers) or null if no face detected
 */
export async function detectFaceAndGetDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await loadFaceModels();

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  return detection.descriptor;
}

/**
 * Calculate Euclidean distance between two face descriptors
 * Lower distance = more similar faces
 * @param descriptor1 - First face descriptor
 * @param descriptor2 - Second face descriptor
 * @returns Distance value (0-2, typically 0-1 for same person)
 */
export function euclideanDistance(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[]
): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

/**
 * Verify if two faces match
 * @param liveDescriptor - Descriptor from live photo
 * @param storedDescriptor - Descriptor from database
 * @param threshold - Match threshold (default 0.6 = 85% confidence)
 * @returns Object with match result and confidence score
 */
export function verifyFaceMatch(
  liveDescriptor: Float32Array | number[],
  storedDescriptor: number[],
  threshold: number = 0.6
): { match: boolean; confidence: number; distance: number } {
  const distance = euclideanDistance(liveDescriptor, storedDescriptor);
  const match = distance < threshold;
  const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));

  return {
    match,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    distance: Math.round(distance * 1000) / 1000, // Round to 3 decimals
  };
}

/**
 * Detect multiple faces in image (for fraud detection)
 * @param imageElement - HTML Image or Video element
 * @returns Number of faces detected
 */
export async function detectMultipleFaces(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<number> {
  await loadFaceModels();

  const detections = await faceapi
    .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.length;
}

/**
 * Check if models are loaded
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

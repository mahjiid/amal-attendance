/**
 * Convert File or Blob to base64 string
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 string to Image element
 */
export function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * Compress image to reduce size
 * @param base64 - Base64 image string
 * @param maxWidth - Maximum width (default 800px)
 * @param quality - JPEG quality 0-1 (default 0.8)
 */
export async function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  const img = await base64ToImage(base64);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate new dimensions
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  canvas.width = width;
  canvas.height = height;

  // Draw and compress
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Create small thumbnail for admin preview
 * @param base64 - Base64 image string
 * @param size - Thumbnail size (default 100px)
 */
export async function createThumbnail(
  base64: string,
  size: number = 100
): Promise<string> {
  const img = await base64ToImage(base64);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = size;
  canvas.height = size;

  // Calculate crop to make square
  const minDim = Math.min(img.width, img.height);
  const sx = (img.width - minDim) / 2;
  const sy = (img.height - minDim) / 2;

  ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
  
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Capture image from video stream
 */
export function captureFromVideo(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Get image dimensions from base64
 */
export async function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  const img = await base64ToImage(base64);
  return {
    width: img.width,
    height: img.height,
  };
}

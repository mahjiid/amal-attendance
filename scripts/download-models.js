// Download Face-API.js models
// Run with: node scripts/download-models.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/';
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

const models = [
  // Tiny Face Detector
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // Face Landmarks
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

// Ensure models directory exists
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

console.log('📥 Downloading Face-API.js models...\n');

let downloaded = 0;
let failed = 0;

models.forEach((model, index) => {
  const url = MODEL_URL + model;
  const dest = path.join(MODELS_DIR, model);

  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        downloaded++;
        console.log(`✅ Downloaded: ${model}`);
        
        if (downloaded + failed === models.length) {
          console.log(`\n🎉 Download complete! ${downloaded}/${models.length} models downloaded.`);
          if (failed > 0) {
            console.log(`⚠️  ${failed} models failed. You may need to download them manually.`);
          }
        }
      });
    } else {
      failed++;
      console.log(`❌ Failed to download: ${model} (Status: ${response.statusCode})`);
      
      if (downloaded + failed === models.length) {
        console.log(`\n⚠️  Download complete with errors. ${downloaded}/${models.length} models downloaded.`);
        console.log(`\n💡 Alternative: Use CDN in your code:`);
        console.log(`   const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';`);
      }
    }
  }).on('error', (err) => {
    failed++;
    console.error(`❌ Error downloading ${model}:`, err.message);
  });
});

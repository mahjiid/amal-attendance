# Manual Model Download Instructions

The automatic download script failed due to network restrictions. Please download the models manually:

## Option 1: Download from CDN (Recommended)

The models will be loaded automatically from CDN when the app runs. No manual download needed!

Just make sure your `/public/models` directory exists (it's already created).

## Option 2: Manual Download (Optional - for offline use)

If you want to host models locally:

1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

2. Download these files to `public/models/`:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2

## Option 3: Use npm package models

The models are included in the face-api.js package at:
`node_modules/face-api.js/weights/`

You can copy them to `public/models/` manually.

## For now, we'll use CDN loading

The app will load models from:
`https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/`

This works automatically, no download needed! ✅

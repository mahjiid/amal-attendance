// Test MongoDB connection
// Run this with: node scripts/test-mongodb.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

console.log('🔍 Testing MongoDB Connection...\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('✅ MongoDB URI found');
console.log('✅ Database:', MONGODB_DB);
console.log('\n🔌 Connecting to MongoDB Atlas...\n');

mongoose.connect(MONGODB_URI, {
  dbName: MONGODB_DB,
})
.then(async () => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('✅ Database:', mongoose.connection.db.databaseName);
  
  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n📁 Collections:', collections.length === 0 ? 'None (will be created automatically)' : collections.map(c => c.name).join(', '));
  
  console.log('\n🎉 MongoDB is ready for face verification!');
  console.log('\n📋 Next steps:');
  console.log('   1. Build face verification UI component');
  console.log('   2. Create photo enrollment admin page');
  console.log('   3. Integrate into kiosk');
  
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check MONGODB_URI in .env.local');
  console.log('   2. Verify password is correct (no < > brackets)');
  console.log('   3. Check IP whitelist in MongoDB Atlas');
  console.log('   4. Ensure cluster is running');
  process.exit(1);
});

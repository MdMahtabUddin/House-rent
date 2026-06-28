require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const tenants = await db.collection('tenants').find({}).toArray();
  console.log('Tenants info:');
  for (const t of tenants) {
    console.log(`ID: ${t._id}, landlordId: ${t.landlordId}`);
  }
  mongoose.disconnect();
}
check();

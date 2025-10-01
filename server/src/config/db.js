const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in .env');
  await mongoose.connect(uri);
  const connectionHost = mongoose.connection?.host || 'unknown-host';
  const connectionName = mongoose.connection?.name || 'unknown-db';
  console.log(`MongoDB connected Successfully (${connectionHost}/${connectionName})`);
};

module.exports = connectDB;
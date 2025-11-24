import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB connection error: MONGO_URI is not defined.\n' +
      'Create a .env file in the server folder with MONGO_URI="your_mongo_connection_string"\n' +
      'Or set the environment variable before starting the server.');
    // Do not exit the process here — allow the server to run for static serving/dev.
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    return false;
  }
};


export default connectDB;

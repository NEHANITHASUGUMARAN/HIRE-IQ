import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    const result = await mongoose.connection.db.collection('proctoringsessions').deleteMany({});
    console.log("Deleted old proctoring sessions:", result.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed", err);
    process.exit(1);
  });

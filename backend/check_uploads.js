import mongoose from "mongoose";
import UploadJob from "./src/models/UploadJob.js";
import dotenv from "dotenv";

dotenv.config();

const checkUploads = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const uploads = await UploadJob.find({});
    console.log(`Found ${uploads.length} uploads:`);
    uploads.forEach((u) => {
      console.log(`- ID: ${u._id}, File: ${u.fileName}, Status: ${u.status}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUploads();

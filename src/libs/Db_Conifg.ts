import mongoose from "mongoose";

const db_Config = async () => {
  // Corrected check: 1 means connected

  try {
    const uri = process.env.MONGO_URI;
    const connect = await mongoose.connect(uri!, {
      dbName: "ecomress",
    });
    console.log(
      `✅ Connected to the database ${connect.connection.name} successfully`,
    );
  } catch (error) {
    console.error("❌ Error in connecting DB:", error);
  }
};
export default db_Config;

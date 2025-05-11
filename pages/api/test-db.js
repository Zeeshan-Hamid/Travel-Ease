import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  try {
    // Use the connection string directly with proper escaping
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    console.log("Connecting to MongoDB with URI:", mongodbUri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')); // Log URI with hidden credentials
    
    const client = await MongoClient.connect(mongodbUri);
    console.log("MongoDB connection successful");
    
    const db = client.db("travel_booking");
    const collections = await db.listCollections().toArray();
    
    client.close();
    
    return res.status(200).json({ 
      success: true, 
      message: "MongoDB connection successful",
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "MongoDB connection failed", 
      error: error.message 
    });
  }
} 
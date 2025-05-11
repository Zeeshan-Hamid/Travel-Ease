import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB = "travel_booking";
// If you want to use environment variables later, you can use this approach:
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/?retryWrites=true&w=majority";

// Cache the MongoDB connection to avoid reconnecting on every API call
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // If we have the cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI, {
    });

    const db = client.db(MONGODB_DB);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Function to get a collection from the database
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
} 
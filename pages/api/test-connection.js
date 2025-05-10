import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    // Test the database connection
    const { client, db } = await connectToDatabase();
    
    // Check if we can list collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.status(200).json({
      status: 'success',
      message: 'MongoDB connection successful',
      collections: collectionNames
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message
    });
  }
} 
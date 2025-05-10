import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id } = req.query;
  const { availableSpots } = req.body;

  if (availableSpots === undefined || availableSpots < 0) {
    return res.status(400).json({ message: 'Invalid spot count' });
  }

  try {
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const tripsCollection = db.collection("trips");

    // Find the trip first to make sure it exists
    const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!trip) {
      client.close();
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Update the available spots
    const result = await tripsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { availableSpots } }
    );

    client.close();

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update available spots' });
    }

    return res.status(200).json({ message: 'Available spots updated successfully' });
  } catch (error) {
    console.error('Error updating available spots:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
} 
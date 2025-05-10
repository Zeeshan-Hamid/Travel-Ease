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
  const { seats } = req.body;

  if (seats === undefined || seats < 0) {
    return res.status(400).json({ message: 'Invalid seat count' });
  }

  try {
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const flightsCollection = db.collection("flights");

    // Find the flight first to make sure it exists
    const flight = await flightsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!flight) {
      client.close();
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Update the seat count
    const result = await flightsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { seats } }
    );

    client.close();

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update seats' });
    }

    return res.status(200).json({ message: 'Seats updated successfully' });
  } catch (error) {
    console.error('Error updating seats:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
} 
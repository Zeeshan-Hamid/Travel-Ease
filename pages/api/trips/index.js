import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const tripsCollection = await getCollection('trips');
    
    // Get all trips
    const trips = await tripsCollection.find({}).toArray();

    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
} 
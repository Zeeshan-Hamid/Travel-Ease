import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const busesCollection = await getCollection('buses');
    
    // Get all buses
    const buses = await busesCollection.find({}).toArray();

    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
} 
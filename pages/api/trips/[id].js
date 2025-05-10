import { getCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid trip ID' });
  }

  try {
    const tripsCollection = await getCollection('trips');
    
    // Get trip by ID
    const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ error: 'Failed to fetch trip details' });
  }
} 
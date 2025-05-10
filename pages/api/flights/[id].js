import { getCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid flight ID' });
  }

  try {
    const flightsCollection = await getCollection('flights');
    
    // Get flight by ID
    const flight = await flightsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.status(200).json(flight);
  } catch (error) {
    console.error('Error fetching flight details:', error);
    res.status(500).json({ error: 'Failed to fetch flight details' });
  }
} 
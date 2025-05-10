import { getCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid bus ID' });
  }

  try {
    const busesCollection = await getCollection('buses');
    
    // Get bus by ID
    const bus = await busesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.status(200).json(bus);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Failed to fetch bus details' });
  }
} 
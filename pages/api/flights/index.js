import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const flightsCollection = await getCollection('flights');
    
    // Get all flights
    const flights = await flightsCollection.find({}).toArray();

    res.status(200).json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
} 
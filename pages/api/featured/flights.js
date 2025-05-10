import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const flightsCollection = await getCollection('flights');
    const featuredFlights = await flightsCollection
      .find({ featured: true })
      .sort({ rating: -1 })
      .toArray();

    res.status(200).json(featuredFlights);
  } catch (error) {
    console.error('Error fetching featured flights:', error);
    res.status(500).json({ error: 'Failed to fetch featured flights' });
  }
} 
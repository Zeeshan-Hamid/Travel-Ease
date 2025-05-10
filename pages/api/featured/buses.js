import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const busesCollection = await getCollection('buses');
    const featuredBuses = await busesCollection
      .find({ featured: true })
      .sort({ rating: -1 })
      .toArray();

    res.status(200).json(featuredBuses);
  } catch (error) {
    console.error('Error fetching featured buses:', error);
    res.status(500).json({ error: 'Failed to fetch featured buses' });
  }
} 
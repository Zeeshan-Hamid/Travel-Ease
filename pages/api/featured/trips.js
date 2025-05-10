import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const tripsCollection = await getCollection('trips');
    const featuredTrips = await tripsCollection
      .find({ featured: true })
      .sort({ rating: -1 })
      .toArray();

    res.status(200).json(featuredTrips);
  } catch (error) {
    console.error('Error fetching featured trips:', error);
    res.status(500).json({ error: 'Failed to fetch featured trips' });
  }
} 
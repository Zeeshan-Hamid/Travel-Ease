import { getCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const flightsCollection = await getCollection('flights');
    const busesCollection = await getCollection('buses');
    const tripsCollection = await getCollection('trips');

    const [featuredFlights, featuredBuses, featuredTrips] = await Promise.all([
      flightsCollection.find({ featured: true }).sort({ rating: -1 }).toArray(),
      busesCollection.find({ featured: true }).sort({ rating: -1 }).toArray(),
      tripsCollection.find({ featured: true }).sort({ rating: -1 }).toArray()
    ]);

    res.status(200).json({
      flights: featuredFlights,
      buses: featuredBuses,
      trips: featuredTrips
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({ error: 'Failed to fetch featured items' });
  }
} 
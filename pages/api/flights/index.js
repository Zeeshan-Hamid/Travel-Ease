import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();
    const flightsCollection = db.collection('flights');

    switch (method) {
      case 'GET':
        // Get all flights - public access
        const flights = await flightsCollection.find({}).toArray();
        return res.status(200).json(flights);
      
      case 'POST':
        // Admin only for POST requests
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }
        
        // Add a new flight
        const flightData = { ...req.body };
        
        // Validate required fields
        const requiredFields = ['name', 'origin', 'destination', 'price'];
        for (const field of requiredFields) {
          if (!flightData[field]) {
            return res.status(400).json({ message: `Missing required field: ${field}` });
          }
        }
        
        // Convert prices to numbers
        if (typeof flightData.price === 'string') {
          flightData.price = parseFloat(flightData.price);
        }
        
        // Convert string dates to Date objects
        if (flightData.startDate && typeof flightData.startDate === 'string') {
          flightData.startDate = new Date(flightData.startDate);
        }
        
        if (flightData.endDate && typeof flightData.endDate === 'string') {
          flightData.endDate = new Date(flightData.endDate);
        }
        
        // Add creation timestamp
        flightData.createdAt = new Date();
        
        const result = await flightsCollection.insertOne(flightData);
        
        return res.status(201).json({
          message: 'Flight created successfully',
          flight: { _id: result.insertedId, ...flightData }
        });
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in flights API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 
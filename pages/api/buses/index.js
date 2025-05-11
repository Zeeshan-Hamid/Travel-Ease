import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();
    const busesCollection = db.collection('buses');

    switch (method) {
      case 'GET':
        // Get all buses - public access
        const buses = await busesCollection.find({}).toArray();
        return res.status(200).json(buses);
      
      case 'POST':
        // Admin only for POST requests
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }
        
        // Add a new bus
        const busData = { ...req.body };
        
        // Validate required fields
        const requiredFields = ['name', 'origin', 'destination', 'price'];
        for (const field of requiredFields) {
          if (!busData[field]) {
            return res.status(400).json({ message: `Missing required field: ${field}` });
          }
        }
        
        // Convert prices to numbers
        if (typeof busData.price === 'string') {
          busData.price = parseFloat(busData.price);
        }
        
        // Convert string dates to Date objects
        if (busData.startDate && typeof busData.startDate === 'string') {
          busData.startDate = new Date(busData.startDate);
        }
        
        if (busData.endDate && typeof busData.endDate === 'string') {
          busData.endDate = new Date(busData.endDate);
        }
        
        // Add creation timestamp
        busData.createdAt = new Date();
        
        const result = await busesCollection.insertOne(busData);
        
        return res.status(201).json({
          message: 'Bus created successfully',
          bus: { _id: result.insertedId, ...busData }
        });
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in buses API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 
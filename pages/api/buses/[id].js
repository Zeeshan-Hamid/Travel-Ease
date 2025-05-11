import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    const { db } = await connectToDatabase();
    const busesCollection = db.collection('buses');

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid bus ID' });
    }

    const objectId = new ObjectId(id);

    switch (method) {
      case 'GET':
        // Get a single bus - public access
        const bus = await busesCollection.findOne({ _id: objectId });
        
        if (!bus) {
          return res.status(404).json({ message: 'Bus not found' });
        }
        
        return res.status(200).json(bus);
      
      case 'PUT':
      case 'DELETE':
        // Admin only for PUT and DELETE requests
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }

        if (method === 'PUT') {
          // Update a bus
          const updateData = { ...req.body };
          
          // Convert string dates to Date objects
          if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
          }
          
          if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
          }
          
          const updatedBus = await busesCollection.findOneAndUpdate(
            { _id: objectId },
            { $set: updateData },
            { returnDocument: 'after' }
          );
          
          if (!updatedBus.value) {
            return res.status(404).json({ message: 'Bus not found' });
          }
          
          return res.status(200).json(updatedBus.value);
        } else {
          // Delete a bus
          const result = await busesCollection.deleteOne({ _id: objectId });
          
          if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Bus not found' });
          }
          
          return res.status(200).json({ message: 'Bus deleted successfully' });
        }
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in buses API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 
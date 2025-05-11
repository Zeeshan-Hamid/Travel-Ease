import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  // Get session using getServerSession for server-side
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const objectId = new ObjectId(id);

    switch (method) {
      case 'GET':
        // Get a single user
        const user = await usersCollection.findOne({ _id: objectId });
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove sensitive information
        delete user.password;
        
        return res.status(200).json(user);
      
      case 'PUT':
        // Update a user
        const { name, email, isAdmin } = req.body;
        
        const updatedUser = await usersCollection.findOneAndUpdate(
          { _id: objectId },
          { 
            $set: { 
              ...(name && { name }),
              ...(email && { email }),
              isAdmin: !!isAdmin
            } 
          },
          { returnDocument: 'after' }
        );
        
        if (!updatedUser.value) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json(updatedUser.value);
      
      case 'DELETE':
        // Delete a user
        const result = await usersCollection.deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({ message: 'User deleted successfully' });
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in user API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 
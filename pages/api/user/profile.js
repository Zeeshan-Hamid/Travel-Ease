import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userId = session.user.id;
  const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
  const client = await MongoClient.connect(mongodbUri);
  const db = client.db("travel_booking");
  const usersCollection = db.collection("users");

  // GET request to fetch user profile
  if (req.method === "GET") {
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        client.close();
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send the password to the client
      const { password, ...userWithoutPassword } = user;
      
      client.close();
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      client.close();
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // PUT request to update user profile
  if (req.method === "PUT") {
    const { name, email, currentPassword, newPassword } = req.body;
    
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        client.close();
        return res.status(404).json({ message: "User not found" });
      }

      // Prepare update object
      const updateData = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      // If user wants to change password
      if (currentPassword && newPassword) {
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValid) {
          client.close();
          return res.status(403).json({ message: "Current password is incorrect" });
        }
        
        // Hash new password
        updateData.password = await bcrypt.hash(newPassword, 12);
      }
      
      // Update user
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
      
      client.close();
      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      client.close();
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Method not allowed
  client.close();
  return res.status(405).json({ message: "Method not allowed" });
} 
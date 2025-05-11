import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { MongoClient, ObjectId } from "mongodb";

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

  // GET request to fetch user bookings
  if (req.method === "GET") {
    try {
      const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { bookings: 1 } }
      );
      
      if (!user) {
        client.close();
        return res.status(404).json({ message: "User not found" });
      }

      const bookings = user.bookings || [];
      
      // Enhance bookings with item details
      const enhancedBookings = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const collection = db.collection(booking.type + 's');
            const item = await collection.findOne({ _id: new ObjectId(booking.itemId) });
            
            return {
              ...booking,
              itemDetails: item || { message: "Item details not found" }
            };
          } catch (error) {
            return {
              ...booking,
              itemDetails: { message: "Error fetching item details" }
            };
          }
        })
      );
      
      client.close();
      return res.status(200).json(enhancedBookings);
    } catch (error) {
      client.close();
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // POST request to add a new booking
  if (req.method === "POST") {
    const { type, itemId, passengers, totalPrice } = req.body;
    
    if (!type || !itemId || !passengers || !totalPrice) {
      client.close();
      return res.status(422).json({ message: "Missing required booking information" });
    }
    
    try {
      const bookingId = new ObjectId().toString();
      
      const newBooking = {
        bookingId,
        type,
        itemId,
        bookedAt: new Date(),
        status: 'confirmed',
        passengers,
        totalPrice
      };
      
      // Check if the user has a bookings array, create it if it doesn't exist
      const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { bookings: 1 } }
      );
      
      if (!user || !user.bookings) {
        // Initialize bookings array if it doesn't exist
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { bookings: [] } }
        );
      }
      
      // Now push the new booking
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { bookings: newBooking } }
      );
      
      client.close();
      return res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (error) {
      client.close();
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // PUT request to update booking status (e.g., cancel)
  if (req.method === "PUT") {
    const { bookingId, status } = req.body;
    
    if (!bookingId || !status) {
      client.close();
      return res.status(422).json({ message: "Missing required information" });
    }
    
    try {
      const result = await usersCollection.updateOne(
        { 
          _id: new ObjectId(userId),
          "bookings.bookingId": bookingId 
        },
        { 
          $set: { "bookings.$.status": status } 
        }
      );
      
      if (result.matchedCount === 0) {
        client.close();
        return res.status(404).json({ message: "Booking not found" });
      }
      
      client.close();
      return res.status(200).json({ message: "Booking updated successfully" });
    } catch (error) {
      client.close();
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Method not allowed
  client.close();
  return res.status(405).json({ message: "Method not allowed" });
} 
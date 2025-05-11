import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ message: "Invalid input" });
  }

  if (password.trim().length < 7) {
    return res.status(422).json({ message: "Password should be at least 7 characters long" });
  }

  try {
    // Use the connection string directly with proper escaping
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking"); // Use travel_booking database
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      client.close();
      return res.status(422).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      bookings: [],
      createdAt: new Date()
    });

    client.close();
    return res.status(201).json({ message: "User created", userId: result.insertedId });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
} 
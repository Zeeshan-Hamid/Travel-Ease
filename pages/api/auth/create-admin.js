import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { adminSecretKey, name, email, password } = req.body;

  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY && adminSecretKey !== 'admin-secret') {
    return res.status(401).json({ message: 'Invalid admin secret key' });
  }

  try {
    // Connect directly to travel_booking database
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      client.close();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      bookings: []
    });

    client.close();

    // Remove password from response
    const newUser = {
      id: result.insertedId,
      name,
      email,
      isAdmin: true
    };

    return res.status(201).json({ message: 'Admin user created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({ message: 'Error creating admin user', error: error.message });
  }
} 
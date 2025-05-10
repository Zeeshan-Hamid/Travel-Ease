const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB = "travel_booking";

// Sample trip data
const trips = [
  {
    name: "Paris City Tour",
    destination: "Paris, France",
    description: "Experience the magic of Paris with a guided tour of the city's most iconic landmarks. Visit the Eiffel Tower, Louvre Museum, Notre Dame Cathedral, and take a cruise along the Seine River.",
    duration: "5 days",
    price: 1299,
    rating: 4.7,
    availableSpots: 20,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80",
    startDate: new Date("2023-06-15"),
    endDate: new Date("2023-06-20"),
  },
  {
    name: "Bali Paradise Retreat",
    destination: "Bali, Indonesia",
    description: "Escape to the tropical paradise of Bali and unwind in luxury. Explore ancient temples, lush rice terraces, and pristine beaches while enjoying traditional Balinese hospitality.",
    duration: "7 days",
    price: 1599,
    rating: 4.8,
    availableSpots: 15,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
    startDate: new Date("2023-07-10"),
    endDate: new Date("2023-07-17"),
  },
  {
    name: "New York City Adventure",
    destination: "New York, USA",
    description: "Discover the vibrant energy of New York City. See the Statue of Liberty, Times Square, Central Park, and Broadway. Experience the culture, cuisine, and excitement of the Big Apple.",
    duration: "4 days",
    price: 1099,
    rating: 4.5,
    availableSpots: 25,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    startDate: new Date("2023-08-05"),
    endDate: new Date("2023-08-09"),
  },
  {
    name: "Tokyo Explorer",
    destination: "Tokyo, Japan",
    description: "Immerse yourself in the unique blend of traditional and ultramodern culture in Tokyo. Visit ancient temples, bustling markets, and futuristic districts in this captivating city.",
    duration: "6 days",
    price: 1799,
    rating: 4.9,
    availableSpots: 18,
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    startDate: new Date("2023-09-12"),
    endDate: new Date("2023-09-18"),
  },
  {
    name: "African Safari",
    destination: "Kenya",
    description: "Embark on a thrilling safari adventure through Kenya's stunning national parks. Witness the magnificent wildlife in their natural habitat and experience the rich culture of local tribes.",
    duration: "8 days",
    price: 2299,
    rating: 4.8,
    availableSpots: 12,
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
    startDate: new Date("2023-10-15"),
    endDate: new Date("2023-10-23"),
  }
];

async function seedDatabase() {
  let client;
  
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to MongoDB successfully");
    
    const db = client.db(MONGODB_DB);
    const tripsCollection = db.collection("trips");
    
    // Check if collection already has data
    const existingTripsCount = await tripsCollection.countDocuments();
    
    if (existingTripsCount > 0) {
      console.log(`Database already has ${existingTripsCount} trips.`);
      console.log("Dropping existing trips collection...");
      await tripsCollection.drop();
      console.log("Collection dropped successfully");
    }
    
    // Insert seed data
    const result = await tripsCollection.insertMany(trips);
    
    console.log(`Seeded ${result.insertedCount} trips successfully`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
  }
}

seedDatabase(); 
import { MongoClient } from 'mongodb';

// Properly encode the password with special characters
const username = 'zeeshanhamid17';
const password = encodeURIComponent('$zee03052002');
const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.aqabk0o.mongodb.net/?retryWrites=true&w=majority`;
const MONGODB_DB = "travel_booking";

async function seedDatabase() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(MONGODB_DB);

    // Clear existing collections
    await db.collection('flights').deleteMany({});
    await db.collection('buses').deleteMany({});
    await db.collection('trips').deleteMany({});

    console.log('Collections cleared');

    // Seed flights
    const flights = [
      {
        from: 'Karachi',
        to: 'Lahore',
        departureDate: new Date('2023-05-15T10:00:00Z'),
        arrivalDate: new Date('2023-05-15T11:45:00Z'),
        price: 120,
        airline: 'PIA',
        flightNumber: 'PK-303',
        duration: '1h 45m',
        featured: true,
        rating: 4.5,
        seats: 120,
        image: '/images/flight-khi-lhe.jpg'
      },
      {
        from: 'Lahore',
        to: 'Islamabad',
        departureDate: new Date('2023-05-22T08:00:00Z'),
        arrivalDate: new Date('2023-05-22T08:55:00Z'),
        price: 180,
        airline: 'Serene Air',
        flightNumber: 'ER-522',
        duration: '55m',
        featured: true,
        rating: 4.2,
        seats: 80,
        image: '/images/flight-lhe-isb.jpg'
      },
      {
        from: 'Islamabad',
        to: 'Karachi',
        departureDate: new Date('2023-05-25T14:30:00Z'),
        arrivalDate: new Date('2023-05-25T16:30:00Z'),
        price: 150,
        airline: 'Airblue',
        flightNumber: 'PA-213',
        duration: '2h',
        featured: false,
        rating: 3.8,
        seats: 100,
        image: '/images/flight-isb-khi.jpg'
      },
      {
        from: 'Karachi',
        to: 'Dubai',
        departureDate: new Date('2023-06-05T23:00:00Z'),
        arrivalDate: new Date('2023-06-06T01:15:00Z'),
        price: 350,
        airline: 'Emirates',
        flightNumber: 'EK-607',
        duration: '2h 15m',
        featured: true,
        rating: 4.8,
        seats: 220,
        image: '/images/flight-khi-dxb.jpg'
      },
      {
        from: 'Lahore',
        to: 'Dubai',
        departureDate: new Date('2023-06-10T22:00:00Z'),
        arrivalDate: new Date('2023-06-11T00:30:00Z'),
        price: 380,
        airline: 'flydubai',
        flightNumber: 'FZ-334',
        duration: '2h 30m',
        featured: false,
        rating: 4.0,
        seats: 180,
        image: '/images/flight-lhe-dxb.jpg'
      },
      {
        from: 'Islamabad',
        to: 'Bangkok',
        departureDate: new Date('2023-06-12T19:00:00Z'),
        arrivalDate: new Date('2023-06-13T00:30:00Z'),
        price: 420,
        airline: 'Thai Airways',
        flightNumber: 'TG-346',
        duration: '5h 30m',
        featured: true,
        rating: 4.7,
        seats: 250,
        image: '/images/flight-isb-bkk.jpg'
      }
    ];

    // Seed buses
    const buses = [
      {
        from: 'Islamabad',
        to: 'Lahore',
        departureDate: new Date('2023-05-18T09:00:00Z'),
        arrivalDate: new Date('2023-05-18T13:30:00Z'),
        price: 45,
        busCompany: 'Daewoo Express',
        busNumber: 'DW-123',
        duration: '4h 30m',
        featured: true,
        rating: 4.3,
        seats: 40,
        image: '/images/bus-isb-lhe.jpg'
      },
      {
        from: 'Lahore',
        to: 'Faisalabad',
        departureDate: new Date('2023-05-20T11:00:00Z'),
        arrivalDate: new Date('2023-05-20T13:30:00Z'),
        price: 25,
        busCompany: 'Faisal Movers',
        busNumber: 'FM-456',
        duration: '2h 30m',
        featured: false,
        rating: 3.9,
        seats: 45,
        image: '/images/bus-lhe-fsd.jpg'
      },
      {
        from: 'Multan',
        to: 'Lahore',
        departureDate: new Date('2023-05-25T08:00:00Z'),
        arrivalDate: new Date('2023-05-25T13:15:00Z'),
        price: 30,
        busCompany: 'Skyways',
        busNumber: 'SW-789',
        duration: '5h 15m',
        featured: true,
        rating: 4.1,
        seats: 38,
        image: '/images/bus-mul-lhe.jpg'
      },
      {
        from: 'Karachi',
        to: 'Hyderabad',
        departureDate: new Date('2023-05-28T07:30:00Z'),
        arrivalDate: new Date('2023-05-28T09:30:00Z'),
        price: 20,
        busCompany: 'Daewoo Express',
        busNumber: 'DW-456',
        duration: '2h',
        featured: true,
        rating: 4.0,
        seats: 42,
        image: '/images/bus-khi-hyd.jpg'
      },
      {
        from: 'Peshawar',
        to: 'Islamabad',
        departureDate: new Date('2023-06-01T10:00:00Z'),
        arrivalDate: new Date('2023-06-01T12:30:00Z'),
        price: 35,
        busCompany: 'Bilal Travels',
        busNumber: 'BT-101',
        duration: '2h 30m',
        featured: false,
        rating: 3.7,
        seats: 35,
        image: '/images/bus-pew-isb.jpg'
      }
    ];

    // Seed trips
    const trips = [
      {
        name: 'Dubai City Tour',
        destination: 'Dubai',
        startDate: new Date('2023-06-05T00:00:00Z'),
        endDate: new Date('2023-06-10T00:00:00Z'),
        price: 350,
        duration: '5 days',
        description: 'Experience the luxury and modern architecture of Dubai with this comprehensive city tour.',
        featured: true,
        rating: 4.8,
        availableSpots: 15,
        image: '/images/trip-dubai.jpg'
      },
      {
        name: 'Northern Areas Explorer',
        destination: 'Hunza',
        startDate: new Date('2023-06-15T00:00:00Z'),
        endDate: new Date('2023-06-22T00:00:00Z'),
        price: 280,
        duration: '7 days',
        description: 'Discover the breathtaking beauty of Pakistan\'s northern areas including Hunza, Skardu and Fairy Meadows.',
        featured: true,
        rating: 4.9,
        availableSpots: 10,
        image: '/images/trip-hunza.jpg'
      },
      {
        name: 'Bangkok Adventure',
        destination: 'Bangkok',
        startDate: new Date('2023-06-12T00:00:00Z'),
        endDate: new Date('2023-06-18T00:00:00Z'),
        price: 420,
        duration: '6 days',
        description: 'Explore the vibrant culture, delicious food, and historic temples of Bangkok.',
        featured: true,
        rating: 4.6,
        availableSpots: 8,
        image: '/images/trip-bangkok.jpg'
      },
      {
        name: 'Coastal Karachi',
        destination: 'Karachi',
        startDate: new Date('2023-07-01T00:00:00Z'),
        endDate: new Date('2023-07-04T00:00:00Z'),
        price: 150,
        duration: '3 days',
        description: 'Enjoy the beaches and coastal areas of Karachi with this weekend getaway package.',
        featured: false,
        rating: 4.0,
        availableSpots: 20,
        image: '/images/trip-karachi.jpg'
      },
      {
        name: 'Historical Lahore',
        destination: 'Lahore',
        startDate: new Date('2023-07-10T00:00:00Z'),
        endDate: new Date('2023-07-13T00:00:00Z'),
        price: 120,
        duration: '3 days',
        description: 'Discover the rich cultural heritage and historical monuments of Lahore.',
        featured: false,
        rating: 4.4,
        availableSpots: 25,
        image: '/images/trip-lahore.jpg'
      }
    ];

    // Insert data into collections
    await db.collection('flights').insertMany(flights);
    await db.collection('buses').insertMany(buses);
    await db.collection('trips').insertMany(trips);

    console.log('Database seeded successfully!');
    console.log(`Inserted ${flights.length} flights, ${buses.length} buses, and ${trips.length} trips.`);

    client.close();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Execute the seed function
seedDatabase(); 
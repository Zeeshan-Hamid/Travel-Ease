import { getCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { query, type, date } = req.query;
    
    if (!query && !date) {
      return res.status(400).json({ error: 'Search query or date is required' });
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = query ? query.toLowerCase() : '';

    // Get collections
    const flightsCollection = await getCollection('flights');
    const busesCollection = await getCollection('buses');
    const tripsCollection = await getCollection('trips');

    let results = {
      flights: [],
      buses: [],
      trips: []
    };

    // Build search conditions
    const buildSearchConditions = (dateField) => {
      const conditions = [];
      
      // Text search conditions
      if (searchQuery) {
        conditions.push({ from: { $regex: searchQuery, $options: 'i' } });
        conditions.push({ to: { $regex: searchQuery, $options: 'i' } });
      }
      
      // Date condition - if date is provided
      if (date) {
        // Create a date range for the selected date (entire day)
        const selectedDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        conditions.push({ 
          [dateField]: { 
            $gte: selectedDate, 
            $lt: nextDay 
          } 
        });
      }
      
      return conditions.length > 0 ? { $or: conditions } : {};
    };

    // If type is specified, only search that type
    if (type) {
      switch (type) {
        case 'flights':
          const flightConditions = buildSearchConditions('departureDate');
          if (searchQuery) {
            flightConditions.$or.push({ airline: { $regex: searchQuery, $options: 'i' } });
          }
          results.flights = await flightsCollection.find(flightConditions).toArray();
          break;
        case 'buses':
          const busConditions = buildSearchConditions('departureDate');
          if (searchQuery) {
            busConditions.$or.push({ busCompany: { $regex: searchQuery, $options: 'i' } });
          }
          results.buses = await busesCollection.find(busConditions).toArray();
          break;
        case 'trips':
          const tripConditions = [];
          if (searchQuery) {
            tripConditions.push({ name: { $regex: searchQuery, $options: 'i' } });
            tripConditions.push({ destination: { $regex: searchQuery, $options: 'i' } });
            tripConditions.push({ description: { $regex: searchQuery, $options: 'i' } });
          }
          
          if (date) {
            const selectedDate = new Date(date);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // For trips, check if the selected date falls within the trip's date range
            tripConditions.push({ 
              $and: [
                { startDate: { $lte: selectedDate } },
                { endDate: { $gte: selectedDate } }
              ]
            });
          }
          
          const tripQuery = tripConditions.length > 0 ? { $or: tripConditions } : {};
          results.trips = await tripsCollection.find(tripQuery).toArray();
          break;
      }
    } else {
      // Search all types
      const [flights, buses, trips] = await Promise.all([
        flightsCollection.find((() => {
          const conditions = buildSearchConditions('departureDate');
          if (searchQuery) {
            conditions.$or.push({ airline: { $regex: searchQuery, $options: 'i' } });
          }
          return conditions;
        })()).toArray(),
        
        busesCollection.find((() => {
          const conditions = buildSearchConditions('departureDate');
          if (searchQuery) {
            conditions.$or.push({ busCompany: { $regex: searchQuery, $options: 'i' } });
          }
          return conditions;
        })()).toArray(),
        
        tripsCollection.find((() => {
          const tripConditions = [];
          if (searchQuery) {
            tripConditions.push({ name: { $regex: searchQuery, $options: 'i' } });
            tripConditions.push({ destination: { $regex: searchQuery, $options: 'i' } });
            tripConditions.push({ description: { $regex: searchQuery, $options: 'i' } });
          }
          
          if (date) {
            const selectedDate = new Date(date);
            tripConditions.push({ 
              $and: [
                { startDate: { $lte: selectedDate } },
                { endDate: { $gte: selectedDate } }
              ]
            });
          }
          
          return tripConditions.length > 0 ? { $or: tripConditions } : {};
        })()).toArray()
      ]);

      results = {
        flights,
        buses,
        trips
      };
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
} 
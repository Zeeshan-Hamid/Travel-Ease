import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Trips({ initialTrips }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(!initialTrips.length);
  const [error, setError] = useState('');
  
  // Fetch trips on page load
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        console.log('Fetching trips from API...');
        const response = await fetch('/api/trips');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response from API:', response.status, errorData);
          throw new Error(`Failed to fetch trips: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Trips fetched successfully:', data.length);
        setTrips(data);
        setError('');
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);
  
  // Filter trips based on search term
  const filteredTrips = trips.filter(trip => 
    trip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort trips based on selected criteria
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find and Book Trips</h1>
          <p className="text-green-100">Discover amazing travel packages and adventures</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white shadow-md py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, destination..."
              className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-sm">Sort by:</label>
            <select
              className="px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="rating">Rating (Best)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading trips...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.length > 0 ? (
              sortedTrips.map((trip) => (
                <div 
                  key={trip._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push(`/trips/${trip._id}`)}
                >
                  <div className="relative h-48">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Trip</span>
                    </div>
                    {trip.image && (
                      <Image
                        src={trip.image}
                        alt={trip.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        {trip.destination}
                      </span>
                      <span className="text-green-600 font-medium text-xl">
                        ${trip.price}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 my-2">
                      {trip.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {trip.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(trip.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">
                          {trip.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {trip.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No trips found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Back to home button */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Use SSG for trips since they don't change as frequently
export async function getStaticProps() {
  // Return empty trips at build time to avoid connection errors
  return {
    props: {
      initialTrips: []
    },
    // Use short revalidation time to fetch real data soon after deployment
    revalidate: 10
  };
} 
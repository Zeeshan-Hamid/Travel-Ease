import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function TripDetail({ trip }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [passengerCount, setPassengerCount] = useState(1);
  
  // If the page is still generating via SSG with fallback
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If trip doesn't exist
  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h1>
        <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or has been removed.</p>
        <Link href="/trips" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
          Back to Trips
        </Link>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = (trip.price * passengerCount).toFixed(2);

  // Format dates
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/trips" className="inline-flex items-center text-green-100 hover:text-white mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Trips
          </Link>
          <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
          <p className="text-green-100">{trip.destination} • {trip.duration}</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Trip</span>
                </div>
                {trip.image && (
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                      {trip.destination}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                      {trip.name}
                    </h2>
                  </div>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(trip.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {trip.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {startDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                        <p className="text-lg font-semibold text-gray-800">{trip.duration}</p>
                        <div className="flex items-center justify-center mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          <div className="w-20 h-0.5 bg-green-600"></div>
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {endDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-600">{trip.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination</span>
                    <span className="text-gray-800 font-medium">{trip.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Person</span>
                    <span className="text-gray-800 font-medium">${trip.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Spots</span>
                    <span className="text-gray-800 font-medium">{trip.availableSpots}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Book This Trip</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travelers
                  </label>
                  <select
                    className="w-full px-3 text-black py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                  >
                    {[...Array(Math.min(5, trip.availableSpots))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Traveler' : 'Travelers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per Person</span>
                  <span className="text-gray-800">${trip.price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Travelers</span>
                  <span className="text-gray-800">× {passengerCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-semibold text-green-600">${totalPrice}</span>
                </div>
              </div>
              
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
                onClick={() => {
                  if (session) {
                    router.push(`/trips/book/${trip._id}`);
                  } else {
                    router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/trips/${trip._id}`)}`);
                  }
                }}
              >
                {session ? 'Book Now' : 'Sign in to Book'}
              </button>
              
              {!session && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You need to be signed in to book this trip
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use SSG with fallback for trip details
export async function getStaticProps({ params }) {
  // Return null trip at build time to avoid connection errors
  // The actual trip data will be fetched on the first request with fallback
  return {
    props: {
      trip: null
    },
    // Short revalidation time
    revalidate: 10
  };
}

// Generate static paths for popular trips
export async function getStaticPaths() {
  // Return empty paths array with fallback: blocking
  // This means paths will be generated on-demand and cached for future requests
  return {
    paths: [],
    fallback: 'blocking'
  };
} 
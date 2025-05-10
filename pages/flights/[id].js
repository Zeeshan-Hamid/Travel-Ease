import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function FlightDetail({ flight }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedClass, setSelectedClass] = useState('Economy');
  
  // If the page is still generating via SSR
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If flight doesn't exist
  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Flight Not Found</h1>
        <p className="text-gray-600 mb-6">The flight you're looking for doesn't exist or has been removed.</p>
        <Link href="/flights" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition">
          Back to Flights
        </Link>
      </div>
    );
  }

  // Calculate total price
  const basePrice = flight.price;
  const classMultiplier = selectedClass === 'Economy' ? 1 : selectedClass === 'Business' ? 1.8 : 2.5;
  const totalPrice = (basePrice * passengerCount * classMultiplier).toFixed(2);

  // Format dates
  const departureDate = new Date(flight.departureDate);
  const arrivalDate = new Date(flight.arrivalDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/flights" className="inline-flex items-center text-indigo-100 hover:text-white mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Flights
          </Link>
          <h1 className="text-3xl font-bold mb-2">{flight.from} to {flight.to}</h1>
          <p className="text-indigo-100">Flight {flight.flightNumber} • {flight.airline}</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Flight</span>
                </div>
                {flight.image && (
                  <Image
                    src={flight.image}
                    alt={`${flight.from} to ${flight.to}`}
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
                    <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                      {flight.airline}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                      {flight.from} → {flight.to}
                    </h2>
                  </div>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(flight.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {flight.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Departure</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {departureDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                        <p className="text-lg font-semibold text-gray-800">{flight.duration}</p>
                        <div className="flex items-center justify-center mt-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                          <div className="w-20 h-0.5 bg-indigo-600"></div>
                          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Arrival</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {arrivalDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight Number</span>
                    <span className="text-gray-800 font-medium">{flight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Airline</span>
                    <span className="text-gray-800 font-medium">{flight.airline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="text-gray-800 font-medium">${flight.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Seats</span>
                    <span className="text-gray-800 font-medium">{flight.seats}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Book This Flight</h3>
              
              <div className="space-y-4 mb-6 text-black">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <select
                    className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-black block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First Class</option>
                  </select>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Base Price</span>
                  <span className="text-gray-800">${basePrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Passengers</span>
                  <span className="text-gray-800">× {passengerCount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Class Adjustment</span>
                  <span className="text-gray-800">× {classMultiplier}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-semibold text-indigo-600">${totalPrice}</span>
                </div>
              </div>
              
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition"
                onClick={() => {
                  if (session) {
                    router.push(`/flights/book/${flight._id}`);
                  } else {
                    router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/flights/${flight._id}`)}`);
                  }
                }}
              >
                {session ? 'Book Now' : 'Sign in to Book'}
              </button>
              
              {!session && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You need to be signed in to book this flight
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use SSR for flight details since they can change
export async function getServerSideProps({ params }) {
  try {
    const { id } = params;
    
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Fetch flight details
    const response = await fetch(`${baseUrl}/api/flights/${id}`);
    
    if (!response.ok) {
      return {
        props: {
          flight: null
        }
      };
    }
    
    const flight = await response.json();
    
    return {
      props: {
        flight
      }
    };
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return {
      props: {
        flight: null
      }
    };
  }
} 
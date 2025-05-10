import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { MongoClient, ObjectId } from 'mongodb';

export default function BookTrip({ trip }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [personCount, setPersonCount] = useState(1);
  const [contactInfo, setContactInfo] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If the page is still generating via SSR
  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If trip doesn't exist or has no spots
  if (!trip || trip.availableSpots <= 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {!trip ? 'Trip Not Found' : 'No Spots Available'}
        </h1>
        <p className="text-gray-600 mb-6">
          {!trip 
            ? "The trip you're looking for doesn't exist or has been removed."
            : "This trip is fully booked. Please check other available trips."
          }
        </p>
        <Link href="/trips" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition">
          Back to Trips
        </Link>
      </div>
    );
  }

  // If not authenticated
  if (status === 'unauthenticated') {
    router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/trips/book/${trip._id}`)}`);
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to book this trip</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Calculate total price
  const basePrice = trip.price;
  const totalPrice = (basePrice * personCount).toFixed(2);

  // Format dates
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!contactInfo.phone) {
      setError('Please provide a contact phone number');
      setLoading(false);
      return;
    }

    if (personCount > trip.availableSpots) {
      setError(`Only ${trip.availableSpots} spots available for this trip`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'trip',
          itemId: trip._id,
          passengers: personCount,
          totalPrice: parseFloat(totalPrice),
          contactInfo
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to book trip');
      }

      // Update available spots
      const updateSpotsResponse = await fetch(`/api/trips/${trip._id}/spots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availableSpots: trip.availableSpots - personCount
        })
      });

      if (!updateSpotsResponse.ok) {
        console.error('Failed to update available spots, but booking was created');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile/bookings');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Book Trip: {trip.name} | TravelEase</title>
      </Head>

      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href={`/trips/${trip._id}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Trip Details
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Your Trip</h1>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
              <p className="mb-4">Your trip has been booked successfully. Redirecting to your bookings...</p>
              <Link href="/profile/bookings" className="text-indigo-600 hover:text-indigo-800 font-medium">
                View My Bookings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Trip Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-40">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Trip</span>
                    </div>
                    {trip.image && (
                      <Image
                        src={trip.image}
                        alt={trip.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {trip.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{trip.destination}</p>
                    
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Start Date</span>
                        <span className="text-gray-800 font-medium">
                          {startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">End Date</span>
                        <span className="text-gray-800 font-medium">
                          {endDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="text-gray-800 font-medium">{trip.duration}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Price per Person</span>
                        <span className="text-gray-800 font-medium">${trip.price}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Available Spots</span>
                        <span className="text-gray-800 font-medium">{trip.availableSpots}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Traveler Information</h3>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={contactInfo.name}
                          onChange={handleInputChange}
                          required
                          className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={contactInfo.email}
                          onChange={handleInputChange}
                          required
                          className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Travelers
                        </label>
                        <select
                          value={personCount}
                          onChange={(e) => setPersonCount(Number(e.target.value))}
                          className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                          {[...Array(Math.min(trip.availableSpots, 10))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'Person' : 'People'}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {trip.availableSpots} spots available
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">Trip Details</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600">{trip.description}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">Price Summary</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price per Person</span>
                          <span className="text-gray-800">${trip.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Travelers</span>
                          <span className="text-gray-800">{personCount}</span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-4">
                        <span className="text-lg font-semibold text-gray-800">Total</span>
                        <span className="text-lg font-semibold text-indigo-600">${totalPrice}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium transition ${
                          loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          'Confirm Booking'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  try {
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const tripsCollection = db.collection("trips");
    
    const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
    
    client.close();
    
    if (!trip) {
      return {
        props: {
          trip: null
        }
      };
    }
    
    return {
      props: {
        trip: JSON.parse(JSON.stringify({
          ...trip,
          _id: trip._id.toString()
        }))
      }
    };
  } catch (error) {
    console.error("Error fetching trip:", error);
    
    return {
      props: {
        trip: null
      }
    };
  }
} 
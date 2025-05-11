import { useState } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { MongoClient, ObjectId } from 'mongodb';

export default function Bookings({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Update local state
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));

      setSuccessMessage('Booking cancelled successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>My Bookings | Travel Booking</title>
      </Head>
      <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
            <Link href="/profile" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Back to Profile
            </Link>
          </div>

          {loading && (
            <div className="text-center py-4">
              <p>Processing your request...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
              <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Browse Travel Options
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const itemDetails = booking.itemDetails || {};
                const bookingType = booking.type;
                
                return (
                  <div 
                    key={booking.bookingId} 
                    className={`border rounded-lg overflow-hidden ${
                      booking.status === 'cancelled' ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row">
                      {itemDetails.image && (
                        <div className="md:w-1/4">
                          <img 
                            src={itemDetails.image} 
                            alt={`${bookingType} image`} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 md:w-3/4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="capitalize text-black text-lg font-semibold mr-3">
                                {bookingType}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            
                            {bookingType === 'flight' && (
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-black">
                                  {itemDetails.from} to {itemDetails.to}
                                </h3>
                                <p className="text-gray-600">
                                  {itemDetails.airline} - Flight {itemDetails.flightNumber}
                                </p>
                                <p className="text-gray-600">
                                  Departure: {itemDetails.departureDate ? formatDate(itemDetails.departureDate) : 'N/A'}
                                </p>
                              </div>
                            )}
                            
                            {bookingType === 'bus' && (
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-black">
                                  {itemDetails.from} to {itemDetails.to}
                                </h3>
                                <p className="text-gray-600 text-black">
                                  {itemDetails.busCompany} - {itemDetails.busNumber}
                                </p>
                                <p className="text-gray-600 text-black ">
                                  Departure: {itemDetails.departureDate ? formatDate(itemDetails.departureDate) : 'N/A'}
                                </p>
                              </div>
                            )}
                            
                            {bookingType === 'trip' && (
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-black">
                                  {itemDetails.name}
                                </h3>
                                <p className="text-gray-600 text-black">
                                  {itemDetails.location}
                                </p>
                                <p className="text-gray-600 text-black">
                                  Duration: {itemDetails.duration}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-4 text-black">
                              <p><span className="font-medium text-black">Booked on:</span> {formatDate(booking.bookedAt)}</p>
                              <p><span className="font-medium text-black">Passengers:</span> {booking.passengers}</p>
                              <p><span className="font-medium text-black">Total Price:</span> ${booking.totalPrice}</p>
                            </div>
                          </div>
                          
                          <div>
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelBooking(booking.bookingId)}
                                disabled={loading}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <Link 
                            href={`/${bookingType}s/${itemDetails._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View {bookingType} details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  try {
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { bookings: 1 } }
    );

    // If user has no bookings or bookings field doesn't exist, initialize with empty array
    if (!user || !user.bookings) {
      // If this is the first time viewing bookings, ensure the user has a bookings array for future use
      if (user && !user.bookings) {
        await usersCollection.updateOne(
          { _id: new ObjectId(session.user.id) },
          { $set: { bookings: [] } }
        );
      }
      
      client.close();
      return {
        props: {
          initialBookings: []
        }
      };
    }

    const bookings = user?.bookings || [];
    
    // Get the travel_booking database for detailed booking info
    const travelDb = client.db("travel_booking");
    
    // Enhance bookings with item details
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const collection = travelDb.collection(booking.type + 's');
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

    return {
      props: {
        initialBookings: JSON.parse(JSON.stringify(enhancedBookings)),
      },
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    
    return {
      props: {
        initialBookings: [],
        error: "Failed to load bookings"
      },
    };
  }
} 
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/AdminLayout';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminDashboard({ stats }) {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard | Travel Booking</title>
      </Head>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{isClient ? stats.userCount : '...'}</dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Flights</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{isClient ? stats.flightCount : '...'}</dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Buses</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{isClient ? stats.busCount : '...'}</dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{isClient ? stats.tripCount : '...'}</dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{isClient ? stats.bookingCount : '...'}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">The latest bookings from users</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {isClient && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking) => (
                    <li key={booking._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{booking.userName}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {booking.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} • {booking.itemName}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(booking.bookedAt).toLocaleDateString()} • ${booking.totalPrice}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent bookings</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">The latest registered users</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {isClient && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <li key={user._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{user.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {user.isAdmin && (
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Admin
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent users</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    // Get counts of various collections
    const userCount = await db.collection('users').countDocuments();
    const flightCount = await db.collection('flights').countDocuments();
    const busCount = await db.collection('buses').countDocuments();
    const tripCount = await db.collection('trips').countDocuments();
    
    // Calculate total bookings across all users
    const users = await db.collection('users').find({}).toArray();
    const bookingCount = users.reduce((total, user) => {
      return total + (user.bookings ? user.bookings.length : 0);
    }, 0);
    
    // Get recent bookings with user and item info
    const recentBookings = [];
    for (const user of users.slice(0, 20)) { // Limit to first 20 users for performance
      if (user.bookings && user.bookings.length > 0) {
        for (const booking of user.bookings.slice(0, 3)) { // Get up to 3 most recent bookings per user
          let itemName = 'Unknown';
          
          // Get item name based on type
          if (booking.type === 'flight') {
            const flight = await db.collection('flights').findOne({ _id: booking.itemId });
            itemName = flight ? flight.name : 'Unknown Flight';
          } else if (booking.type === 'bus') {
            const bus = await db.collection('buses').findOne({ _id: booking.itemId });
            itemName = bus ? bus.name : 'Unknown Bus';
          } else if (booking.type === 'trip') {
            const trip = await db.collection('trips').findOne({ _id: booking.itemId });
            itemName = trip ? trip.name : 'Unknown Trip';
          }
          
          recentBookings.push({
            _id: booking.bookingId,
            userName: user.name,
            type: booking.type,
            itemName,
            status: booking.status,
            bookedAt: booking.bookedAt,
            totalPrice: booking.totalPrice
          });
        }
      }
    }
    
    // Sort recent bookings by date
    recentBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    
    // Get recent users
    const recentUsers = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    return {
      props: {
        stats: {
          userCount,
          flightCount,
          busCount,
          tripCount,
          bookingCount,
          recentBookings: JSON.parse(JSON.stringify(recentBookings.slice(0, 5))),
          recentUsers: JSON.parse(JSON.stringify(recentUsers))
        }
      }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      props: {
        stats: {
          userCount: 0,
          flightCount: 0,
          busCount: 0,
          tripCount: 0,
          bookingCount: 0,
          recentBookings: [],
          recentUsers: []
        }
      }
    };
  }
} 
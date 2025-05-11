import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function AdminUserView({ user }) {
  const router = useRouter();
  
  if (!user) {
    return (
      <AdminLayout>
        <Head>
          <title>User Not Found | Admin</title>
        </Head>
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you are looking for does not exist or has been deleted.</p>
          <Link 
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Users
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Format dates
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <AdminLayout>
      <Head>
        <title>{user.name} | Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <div className="flex space-x-2">
            <Link 
              href={`/admin/users/edit/${user._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Edit User
            </Link>
            <Link 
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Users
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{user.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">User details and account information</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Admin status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.isAdmin ? 'Admin' : 'Regular User'}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {createdAt ? createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bookings</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.bookings ? user.bookings.length : 0} bookings</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* User's bookings */}
        {user.bookings && user.bookings.length > 0 && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">User's booking history</p>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.bookings.map((booking) => (
                    <tr key={booking.bookingId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="capitalize">{booking.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.itemDetails?.name || `${booking.type} ${booking.itemId?.substring(0, 6)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${booking.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { db } = await connectToDatabase();
    
    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(params.id)) {
      return {
        props: { user: null }
      };
    }
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(params.id) });
    
    if (!user) {
      return {
        props: { user: null }
      };
    }
    
    // Enhance bookings with item details if possible
    if (user.bookings && user.bookings.length > 0) {
      for (let i = 0; i < user.bookings.length; i++) {
        const booking = user.bookings[i];
        if (booking.itemId && ObjectId.isValid(booking.itemId)) {
          const itemId = new ObjectId(booking.itemId);
          let itemDetails = null;
          
          if (booking.type === 'flight') {
            itemDetails = await db.collection('flights').findOne({ _id: itemId }, { projection: { name: 1 } });
          } else if (booking.type === 'bus') {
            itemDetails = await db.collection('buses').findOne({ _id: itemId }, { projection: { name: 1 } });
          } else if (booking.type === 'trip') {
            itemDetails = await db.collection('trips').findOne({ _id: itemId }, { projection: { name: 1 } });
          }
          
          if (itemDetails) {
            user.bookings[i].itemDetails = {
              name: itemDetails.name
            };
          }
        }
      }
    }
    
    // Sort bookings by date (newest first)
    if (user.bookings) {
      user.bookings.sort((a, b) => {
        const dateA = a.bookedAt ? new Date(a.bookedAt) : new Date(0);
        const dateB = b.bookedAt ? new Date(b.bookedAt) : new Date(0);
        return dateB - dateA;
      });
    }
    
    // Omit password for security
    delete user.password;
    
    // Format for JSON serialization
    const formattedUser = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? user.createdAt.toString() : null,
      bookings: user.bookings ? user.bookings.map(booking => ({
        ...booking,
        itemId: booking.itemId ? booking.itemId.toString() : null,
        bookedAt: booking.bookedAt ? booking.bookedAt.toString() : null
      })) : []
    };
    
    return {
      props: {
        user: formattedUser
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      props: { user: null }
    };
  }
} 
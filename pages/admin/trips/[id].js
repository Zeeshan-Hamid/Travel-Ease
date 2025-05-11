import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function AdminTripView({ trip }) {
  const router = useRouter();
  
  if (!trip) {
    return (
      <AdminLayout>
        <Head>
          <title>Trip Not Found | Admin</title>
        </Head>
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">The trip you are looking for does not exist or has been deleted.</p>
          <Link 
            href="/admin/trips"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Trips
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Format dates
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  return (
    <AdminLayout>
      <Head>
        <title>{trip.name} | Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Trip Details</h1>
          <div className="flex space-x-2">
            <Link 
              href={`/admin/trips/edit/${trip._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Edit Trip
            </Link>
            <Link 
              href="/admin/trips"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Trips
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{trip.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Trip details and information</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${parseFloat(trip.price).toFixed(2)}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Destination</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.destination}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Origin</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.origin}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {startDate ? startDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {endDate ? endDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.duration || 'Not specified'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Available Spots</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.availableSpots || 'Not specified'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.rating ? `${trip.rating.toFixed(1)}/5` : 'Not rated'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.description || 'No description provided'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
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
        props: { trip: null }
      };
    }
    
    const trip = await db.collection('trips').findOne({ _id: new ObjectId(params.id) });
    
    if (!trip) {
      return {
        props: { trip: null }
      };
    }
    
    // Format for JSON serialization
    const formattedTrip = {
      ...trip,
      _id: trip._id.toString(),
      createdAt: trip.createdAt ? trip.createdAt.toString() : null,
      startDate: trip.startDate ? trip.startDate.toString() : null,
      endDate: trip.endDate ? trip.endDate.toString() : null
    };
    
    return {
      props: {
        trip: formattedTrip
      }
    };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return {
      props: { trip: null }
    };
  }
} 
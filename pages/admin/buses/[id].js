import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function AdminBusView({ bus }) {
  const router = useRouter();
  
  if (!bus) {
    return (
      <AdminLayout>
        <Head>
          <title>Bus Not Found | Admin</title>
        </Head>
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bus Not Found</h1>
          <p className="text-gray-600 mb-6">The bus you are looking for does not exist or has been deleted.</p>
          <Link 
            href="/admin/buses"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Buses
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Format dates
  const startDate = bus.startDate ? new Date(bus.startDate) : null;
  const endDate = bus.endDate ? new Date(bus.endDate) : null;

  return (
    <AdminLayout>
      <Head>
        <title>{bus.name} | Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bus Details</h1>
          <div className="flex space-x-2">
            <Link 
              href={`/admin/buses/edit/${bus._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Edit Bus
            </Link>
            <Link 
              href="/admin/buses"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Buses
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{bus.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Bus details and information</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bus Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.company || 'Not specified'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bus Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.busNumber || 'Not specified'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Origin</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.origin}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Destination</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.destination}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${parseFloat(bus.price).toFixed(2)}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Departure Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {startDate ? startDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Arrival Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {endDate ? endDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.duration || 'Not specified'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bus Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.busType || 'Not specified'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Available Seats</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.availableSeats || 'Not specified'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {bus.createdAt ? new Date(bus.createdAt).toLocaleString() : 'Unknown'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bus.description || 'No description provided'}</dd>
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
        props: { bus: null }
      };
    }
    
    const bus = await db.collection('buses').findOne({ _id: new ObjectId(params.id) });
    
    if (!bus) {
      return {
        props: { bus: null }
      };
    }
    
    // Format for JSON serialization
    const formattedBus = {
      ...bus,
      _id: bus._id.toString(),
      createdAt: bus.createdAt ? bus.createdAt.toString() : null,
      startDate: bus.startDate ? bus.startDate.toString() : null,
      endDate: bus.endDate ? bus.endDate.toString() : null
    };
    
    return {
      props: {
        bus: formattedBus
      }
    };
  } catch (error) {
    console.error('Error fetching bus:', error);
    return {
      props: { bus: null }
    };
  }
} 
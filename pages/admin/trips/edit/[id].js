import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import TravelForm from '@/components/admin/TravelForm';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function EditTrip({ initialTrip }) {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(initialTrip);
  const [loading, setLoading] = useState(!initialTrip);

  useEffect(() => {
    if (!initialTrip && id) {
      const fetchTrip = async () => {
        try {
          const response = await fetch(`/api/trips/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch trip');
          }
          const data = await response.json();
          setTrip(data);
        } catch (error) {
          console.error('Error fetching trip:', error);
          setError('Failed to load trip data');
        } finally {
          setLoading(false);
        }
      };

      fetchTrip();
    }
  }, [id, initialTrip]);

  const handleSubmit = async (tripData) => {
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trip');
      }

      return router.push('/admin/trips');
    } catch (error) {
      console.error('Error updating trip:', error);
      setError(error.message);
      throw error;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!trip) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Trip Not Found</h1>
          <p className="mt-2 text-gray-600">The trip you're looking for doesn't exist or was deleted.</p>
          <button
            onClick={() => router.push('/admin/trips')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Trips
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Trip | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update trip information
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error updating trip</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TravelForm 
          type="trip"
          initialData={trip}
          onSubmit={handleSubmit}
          isEditMode={true}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return {
        props: {
          initialTrip: null,
        },
      };
    }
    
    const { db } = await connectToDatabase();
    const trip = await db.collection('trips').findOne({ _id: new ObjectId(id) });
    
    if (!trip) {
      return {
        props: {
          initialTrip: null,
        },
      };
    }
    
    // Convert MongoDB ObjectId to string and format dates
    return {
      props: {
        initialTrip: JSON.parse(JSON.stringify({
          ...trip,
          _id: trip._id.toString(),
          startDate: trip.startDate ? trip.startDate.toString() : null,
          endDate: trip.endDate ? trip.endDate.toString() : null,
        })),
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps for trip edit:', error);
    return {
      props: {
        initialTrip: null,
      },
    };
  }
} 
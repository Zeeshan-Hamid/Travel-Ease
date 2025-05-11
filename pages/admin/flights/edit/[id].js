import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import TravelForm from '@/components/admin/TravelForm';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function EditFlight({ initialFlight }) {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState('');
  const [flight, setFlight] = useState(initialFlight);
  const [loading, setLoading] = useState(!initialFlight);

  useEffect(() => {
    if (!initialFlight && id) {
      const fetchFlight = async () => {
        try {
          const response = await fetch(`/api/flights/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch flight');
          }
          const data = await response.json();
          setFlight(data);
        } catch (error) {
          console.error('Error fetching flight:', error);
          setError('Failed to load flight data');
        } finally {
          setLoading(false);
        }
      };

      fetchFlight();
    }
  }, [id, initialFlight]);

  const handleSubmit = async (flightData) => {
    try {
      const response = await fetch(`/api/flights/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update flight');
      }

      return router.push('/admin/flights');
    } catch (error) {
      console.error('Error updating flight:', error);
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

  if (!flight) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Flight Not Found</h1>
          <p className="mt-2 text-gray-600">The flight you're looking for doesn't exist or was deleted.</p>
          <button
            onClick={() => router.push('/admin/flights')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Flights
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Flight | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Flight</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update flight information
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
                <h3 className="text-sm font-medium text-red-800">Error updating flight</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TravelForm 
          type="flight"
          initialData={flight}
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
          initialFlight: null,
        },
      };
    }
    
    const { db } = await connectToDatabase();
    const flight = await db.collection('flights').findOne({ _id: new ObjectId(id) });
    
    if (!flight) {
      return {
        props: {
          initialFlight: null,
        },
      };
    }
    
    // Convert MongoDB ObjectId to string and format dates
    return {
      props: {
        initialFlight: JSON.parse(JSON.stringify({
          ...flight,
          _id: flight._id.toString(),
          startDate: flight.startDate ? flight.startDate.toString() : null,
          endDate: flight.endDate ? flight.endDate.toString() : null,
        })),
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps for flight edit:', error);
    return {
      props: {
        initialFlight: null,
      },
    };
  }
} 
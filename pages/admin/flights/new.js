import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import TravelForm from '@/components/admin/TravelForm';

export default function NewFlight() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (flightData) => {
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create flight');
      }

      return router.push('/admin/flights');
    } catch (error) {
      console.error('Error creating flight:', error);
      setError(error.message);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Add New Flight | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Flight</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new flight in the system
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
                <h3 className="text-sm font-medium text-red-800">Error creating flight</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TravelForm 
          type="flight"
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
} 
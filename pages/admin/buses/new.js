import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import TravelForm from '@/components/admin/TravelForm';

export default function NewBus() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (busData) => {
    try {
      const response = await fetch('/api/buses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(busData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bus');
      }

      return router.push('/admin/buses');
    } catch (error) {
      console.error('Error creating bus:', error);
      setError(error.message);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Add New Bus | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Bus</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new bus in the system
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
                <h3 className="text-sm font-medium text-red-800">Error creating bus</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <TravelForm 
          type="bus"
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
} 
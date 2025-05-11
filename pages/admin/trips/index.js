import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminTrips({ initialTrips }) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  
  const columns = [
    { key: 'name', label: 'Name', dataType: 'string' },
    { key: 'tripType', label: 'Trip Type', dataType: 'string' },
    { key: 'origin', label: 'Origin', dataType: 'string' },
    { key: 'destination', label: 'Destination', dataType: 'string' },
    { key: 'startDate', label: 'Start Date', dataType: 'date' },
    { key: 'duration', label: 'Duration (days)', dataType: 'number' },
    { key: 'price', label: 'Price', dataType: 'price' },
  ];

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      setTrips(trips.filter(trip => trip._id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Trips | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Trips</h1>
        </div>

        <DataTable 
          data={trips} 
          columns={columns} 
          type="trip"
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    const trips = await db.collection('trips').find({}).toArray();
    
    // Format data for display
    const formattedTrips = trips.map(trip => ({
      ...trip,
      _id: trip._id.toString(),
      startDate: trip.startDate ? trip.startDate.toString() : null,
      endDate: trip.endDate ? trip.endDate.toString() : null,
    }));

    return {
      props: {
        initialTrips: JSON.parse(JSON.stringify(formattedTrips)),
      },
    };
  } catch (error) {
    console.error('Error fetching trips:', error);
    return {
      props: {
        initialTrips: [],
      },
    };
  }
} 
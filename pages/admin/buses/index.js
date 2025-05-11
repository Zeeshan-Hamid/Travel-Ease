import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminBuses({ initialBuses }) {
  const router = useRouter();
  const [buses, setBuses] = useState(initialBuses);
  
  const columns = [
    { key: 'name', label: 'Name', dataType: 'string' },
    { key: 'busType', label: 'Bus Type', dataType: 'string' },
    { key: 'busNumber', label: 'Bus Number', dataType: 'string' },
    { key: 'origin', label: 'Origin', dataType: 'string' },
    { key: 'destination', label: 'Destination', dataType: 'string' },
    { key: 'startDate', label: 'Departure', dataType: 'date' },
    { key: 'price', label: 'Price', dataType: 'price' },
  ];

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/buses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bus');
      }

      setBuses(buses.filter(bus => bus._id !== id));
    } catch (error) {
      console.error('Error deleting bus:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Buses | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Buses</h1>
        </div>

        <DataTable 
          data={buses} 
          columns={columns} 
          type="bus"
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    const buses = await db.collection('buses').find({}).toArray();
    
    // Format data for display
    const formattedBuses = buses.map(bus => ({
      ...bus,
      _id: bus._id.toString(),
      startDate: bus.startDate ? bus.startDate.toString() : null,
      endDate: bus.endDate ? bus.endDate.toString() : null,
    }));

    return {
      props: {
        initialBuses: JSON.parse(JSON.stringify(formattedBuses)),
      },
    };
  } catch (error) {
    console.error('Error fetching buses:', error);
    return {
      props: {
        initialBuses: [],
      },
    };
  }
} 
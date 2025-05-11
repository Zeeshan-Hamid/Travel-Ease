import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminFlights({ initialFlights }) {
  const router = useRouter();
  const [flights, setFlights] = useState(initialFlights);
  
  const columns = [
    { key: 'name', label: 'Name', dataType: 'string' },
    { key: 'airline', label: 'Airline', dataType: 'string' },
    { key: 'flightNumber', label: 'Flight Number', dataType: 'string' },
    { key: 'origin', label: 'Origin', dataType: 'string' },
    { key: 'destination', label: 'Destination', dataType: 'string' },
    { key: 'startDate', label: 'Departure', dataType: 'date' },
    { key: 'price', label: 'Price', dataType: 'price' },
  ];

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/flights/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flight');
      }

      setFlights(flights.filter(flight => flight._id !== id));
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Flights | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Flights</h1>
        </div>

        <DataTable 
          data={flights} 
          columns={columns} 
          type="flight"
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    const flights = await db.collection('flights').find({}).toArray();
    
    // Format data for display
    const formattedFlights = flights.map(flight => ({
      ...flight,
      _id: flight._id.toString(),
      startDate: flight.startDate ? flight.startDate.toString() : null,
      endDate: flight.endDate ? flight.endDate.toString() : null,
    }));

    return {
      props: {
        initialFlights: JSON.parse(JSON.stringify(formattedFlights)),
      },
    };
  } catch (error) {
    console.error('Error fetching flights:', error);
    return {
      props: {
        initialFlights: [],
      },
    };
  }
} 
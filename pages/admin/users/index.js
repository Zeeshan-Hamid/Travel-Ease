import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminUsers({ initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  
  const columns = [
    { key: 'name', label: 'Name', dataType: 'string' },
    { key: 'email', label: 'Email', dataType: 'string' },
    { key: 'isAdmin', label: 'Admin', dataType: 'boolean' },
    { key: 'createdAt', label: 'Joined', dataType: 'date' },
    { key: 'bookingsCount', label: 'Bookings', dataType: 'number' },
  ];

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const refreshData = () => {
    router.replace(router.asPath);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Users | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        </div>

        <DataTable 
          data={users} 
          columns={columns} 
          type="user"
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    const users = await db.collection('users').find({}).toArray();
    
    // Add bookings count and format dates
    const formattedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      bookingsCount: user.bookings ? user.bookings.length : 0,
      createdAt: user.createdAt ? user.createdAt.toString() : null,
    }));

    return {
      props: {
        initialUsers: JSON.parse(JSON.stringify(formattedUsers)),
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      props: {
        initialUsers: [],
      },
    };
  }
} 
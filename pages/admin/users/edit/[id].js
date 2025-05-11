import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function AdminUserEdit({ user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isAdmin: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false
      });
    }
  }, [user]);

  if (!user) {
    return (
      <AdminLayout>
        <Head>
          <title>User Not Found | Admin</title>
        </Head>
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you are looking for does not exist or has been deleted.</p>
          <Link 
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Users
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('User updated successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/admin/users/${user._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Edit User | Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <div className="flex space-x-2">
            <Link 
              href={`/admin/users/${user._id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {message}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isAdmin" className="font-medium text-gray-700">Admin</label>
                <p className="text-gray-500">Give this user admin privileges</p>
              </div>
            </div>
            
            <div className="pt-5">
              <div className="flex justify-end">
                <Link
                  href={`/admin/users/${user._id}`}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
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
        props: { user: null }
      };
    }
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(params.id) });
    
    if (!user) {
      return {
        props: { user: null }
      };
    }
    
    // Omit password for security
    delete user.password;
    
    // Format for JSON serialization
    const formattedUser = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? user.createdAt.toString() : null
    };
    
    return {
      props: {
        user: formattedUser
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      props: { user: null }
    };
  }
} 
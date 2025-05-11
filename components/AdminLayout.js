import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user?.isAdmin) {
    router.push('/auth/login');
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Flights', path: '/admin/flights', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { name: 'Buses', path: '/admin/buses', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Trips', path: '/admin/trips', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } transition-width duration-300 ease-in-out bg-indigo-800 text-white`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {isSidebarOpen && (
            <span className="text-xl font-semibold">Admin Panel</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-5 px-2">
          {navItems.map((item) => (
            <Link
            href={item.path}
            key={item.name}
            className={`flex items-center px-2 py-2 mt-1 rounded-md ${
              router.pathname === item.path || router.pathname.startsWith(`${item.path}/`)
                ? 'bg-indigo-900 text-white'
                : 'text-indigo-100 hover:bg-indigo-700'
            } transition-colors duration-200`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>
            {isSidebarOpen && (
              <span className="ml-4">{item.name}</span>
            )}
          </Link>
          
          ))}
        </nav>
        <div className="absolute bottom-0 w-full">
          <button
            onClick={handleSignOut}
            className={`flex items-center px-2 py-2 mb-4 w-full ${
              isSidebarOpen ? 'justify-start' : 'justify-center'
            } text-indigo-100 hover:bg-indigo-700 rounded-md transition-colors duration-200`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isSidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="py-6 px-8">
          <div className="mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
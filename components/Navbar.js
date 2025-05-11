import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/auth/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  return (
    <nav className="bg-white shadow-md py-4 px-4 md:px-8 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            TravelEase
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <Link href="/" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname === '/' ? 'text-indigo-600' : ''}`}>
            Home
          </Link>
          <Link href="/flights" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/flights') ? 'text-indigo-600' : ''}`}>
            Flights
          </Link>
          <Link href="/buses" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/buses') ? 'text-indigo-600' : ''}`}>
            Buses
          </Link>
          <Link href="/trips" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/trips') ? 'text-indigo-600' : ''}`}>
            Trips
          </Link>
          {session?.user?.isAdmin && (
            <Link href="/admin" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/admin') ? 'text-indigo-600' : ''}`}>
              Admin
            </Link>
          )}
        </div>

        {/* User Auth */}
        <div className="hidden md:flex items-center">
          {session ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-indigo-700 font-medium">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{session.user.name}</span>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50">
                    My Profile
                  </Link>
                  <Link href="/profile/bookings" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50">
                    My Bookings
                  </Link>
                  {session.user.isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 px-4 py-2 font-medium">
                Login
              </Link>
              <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2 pb-3">
            <Link href="/" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname === '/' ? 'text-indigo-600' : ''}`}>
              Home
            </Link>
            <Link href="/flights" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/flights') ? 'text-indigo-600' : ''}`}>
              Flights
            </Link>
            <Link href="/buses" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/buses') ? 'text-indigo-600' : ''}`}>
              Buses
            </Link>
            <Link href="/trips" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/trips') ? 'text-indigo-600' : ''}`}>
              Trips
            </Link>
            {session?.user?.isAdmin && (
              <Link href="/admin" className={`text-gray-700 hover:text-indigo-600 font-medium px-4 py-2 ${router.pathname.startsWith('/admin') ? 'text-indigo-600' : ''}`}>
                Admin
              </Link>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            {session ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium">
                      {session.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{session.user.name}</span>
                </div>
                <Link href="/profile" className="text-gray-700 hover:bg-gray-100 px-4 py-2 block">
                  My Profile
                </Link>
                <Link href="/profile/bookings" className="text-gray-700 hover:bg-gray-100 px-4 py-2 block">
                  My Bookings
                </Link>
                {session.user.isAdmin && (
                  <Link href="/admin" className="text-gray-700 hover:bg-gray-100 px-4 py-2 block">
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-left"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-4 py-2">
                <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 py-2 font-medium">
                  Login
                </Link>
                <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 
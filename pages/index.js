import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Tabs data
const TABS = [
  { id: 'flights', label: 'Flights', color: 'pink' },
  { id: 'buses', label: 'Buses', color: 'blue' },
  { id: 'trips', label: 'Trips', color: 'green' }
];

export default function Home({ featuredContent = { flights: [], buses: [], trips: [] } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [date, setDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('flights');

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/auth/login");
  };

  const handleSearch = async () => {
    if (!departureCity && !destinationCity && !searchQuery && !date) {
      return;
    }

    setIsSearching(true);
    try {
      // Construct search query
      const query = searchQuery || `${departureCity} ${destinationCity}`.trim();
      
      // Build the URL with query parameters
      let searchUrl = `/api/search?`;
      const params = new URLSearchParams();
      
      if (query) {
        params.append('query', query);
      }
      
      if (date) {
        params.append('date', date);
      }
      
      params.append('type', activeTab);
      
      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDepartureCity('');
    setDestinationCity('');
    setDate('');
    setSearchResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Get the content for the active tab
  const activeContent = searchResults ? searchResults[activeTab] : featuredContent[activeTab] || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Journey</h1>
            <p className="text-xl text-indigo-100">Search across flights, buses, and travel packages</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchResults(null);
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder="Departure city/airport" 
                className="w-full text-black py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Destination city/airport" 
                className="w-full text-black py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
              />
              <input 
                type="date" 
                className="w-full text-black py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
              />
              <button 
                className={`w-full ${isSearching ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 rounded-lg font-medium transition flex items-center justify-center`}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {/* Quick Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Or quickly search by name, destination, company..."
                className="w-full text-black py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {searchResults && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Results or Featured Content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">
            {searchResults ? 'Search Results' : 'Featured Offers'}
          </h2>
          
          {/* Content Grid */}
          {activeContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeContent.map((item, index) => {
                const tab = TABS.find(t => t.id === activeTab);
                return (
                  <div 
                    key={item._id || index} 
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/${activeTab}/${item._id}`)}
                  >
                    <div className="relative h-48">
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">{tab.label}</span>
                      </div>
                      {item.image && (
          <Image
                          src={item.image}
                          alt={item.name || `${item.from} to ${item.to}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority={index < 3}
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`bg-${tab.color}-100 text-${tab.color}-600 px-2 py-1 rounded-full text-xs`}>
                          {tab.label}
                        </span>
                        <span className="text-indigo-600 font-medium text-xl">
                          ${item.price}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 my-2">
                        {activeTab === 'trips' ? item.name : `${item.from} → ${item.to}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(item.departureDate || item.startDate).toLocaleDateString()} • {item.duration}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                        <button 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (session) {
                              router.push(`/${activeTab}/book/${item._id}`);
                            } else {
                              router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${activeTab}/${item._id}`)}`);
                            }
                          }}
                        >
                          {session ? 'Book Now' : 'Sign In to Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {searchResults 
                  ? `No ${activeTab} found matching your search criteria.`
                  : `No featured ${activeTab} available at the moment.`
                }
              </p>
              <p className="mt-2 text-gray-400 text-sm">
                {searchResults 
                  ? 'Try adjusting your search terms or explore other categories.'
                  : 'Check back later for exciting offers!'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 px-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-12">Traveler Reviews</h2>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="italic text-gray-600 mb-4">
              "The booking process was incredibly smooth. I found a great deal on a flight to Dubai and the whole experience was hassle-free."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-medium">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Ahmed K.</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="italic text-gray-600 mb-4">
              "I've been using this service for all my bus travels between cities. The prices are competitive and the buses are always comfortable."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-medium">S</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Sara M.</p>
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="italic text-gray-600 mb-4">
              "The customer service is exceptional. When my flight was delayed, they helped me rebook without any additional fees. Highly recommend!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-medium">F</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Fahad R.</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Terms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Privacy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-400 text-xs">
          © 2025 TravelEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Implement SSR
export async function getServerSideProps() {
  try {
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // First test the connection
    const testResponse = await fetch(`${baseUrl}/api/test-connection`);
    if (!testResponse.ok) {
      console.error('MongoDB connection test failed');
      throw new Error('Database connection failed');
    }

    // Fetch featured content
    const response = await fetch(`${baseUrl}/api/featured/all`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const featuredContent = await response.json();
    
    // Ensure the response has the expected structure
    const safeContent = {
      flights: Array.isArray(featuredContent.flights) ? featuredContent.flights : [],
      buses: Array.isArray(featuredContent.buses) ? featuredContent.buses : [],
      trips: Array.isArray(featuredContent.trips) ? featuredContent.trips : []
    };

    return {
      props: {
        featuredContent: safeContent
      }
    };
  } catch (error) {
    console.error('Error fetching featured content:', error);
    // Return empty arrays for each category to avoid undefined errors
    return {
      props: {
        featuredContent: {
          flights: [],
          buses: [],
          trips: []
        }
      }
    };
  }
}

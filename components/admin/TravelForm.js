import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TravelForm({ type, initialData, onSubmit, isEditMode = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    origin: '',
    destination: '',
    features: '',
    // Specific to different types
    flightNumber: '',
    airline: '',
    duration: '',
    busNumber: '',
    busType: '',
    amenities: '',
    tripType: '',
    accommodation: '',
    activities: '',
  });

  useEffect(() => {
    if (initialData) {
      // Convert dates to the right format for input
      const formattedData = { ...initialData };
      if (formattedData.startDate) {
        // Split the date and time if stored as a single value
        if (typeof formattedData.startDate === 'string' && formattedData.startDate.includes('T')) {
          const [date, time] = formattedData.startDate.split('T');
          formattedData.startDate = date;
          formattedData.startTime = time.substring(0, 5); // HH:MM
        }
      }
      
      if (formattedData.endDate) {
        if (typeof formattedData.endDate === 'string' && formattedData.endDate.includes('T')) {
          const [date, time] = formattedData.endDate.split('T');
          formattedData.endDate = date;
          formattedData.endTime = time.substring(0, 5); // HH:MM
        }
      }
      
      if (Array.isArray(formattedData.features)) {
        formattedData.features = formattedData.features.join(', ');
      }
      
      if (Array.isArray(formattedData.amenities)) {
        formattedData.amenities = formattedData.amenities.join(', ');
      }
      
      if (Array.isArray(formattedData.activities)) {
        formattedData.activities = formattedData.activities.join(', ');
      }
      
      setFormData(prev => ({ ...prev, ...formattedData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'price' || name === 'duration') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.price || !formData.origin || !formData.destination) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Format data for API
    const payload = { ...formData };
    
    // Convert comma-separated strings to arrays
    if (payload.features && typeof payload.features === 'string') {
      payload.features = payload.features.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    if (payload.amenities && typeof payload.amenities === 'string') {
      payload.amenities = payload.amenities.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    if (payload.activities && typeof payload.activities === 'string') {
      payload.activities = payload.activities.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    // Combine date and time fields
    if (payload.startDate && payload.startTime) {
      payload.startDate = new Date(`${payload.startDate}T${payload.startTime}`);
    }
    
    if (payload.endDate && payload.endTime) {
      payload.endDate = new Date(`${payload.endDate}T${payload.endTime}`);
    }
    
    // Remove unused fields based on type
    const fieldsToKeep = [
      'name', 'description', 'price', 'imageUrl', 'startDate', 'endDate', 'origin', 'destination', 'features',
      ...(type === 'flight' ? ['flightNumber', 'airline', 'duration'] : []),
      ...(type === 'bus' ? ['busNumber', 'busType', 'amenities', 'duration'] : []),
      ...(type === 'trip' ? ['tripType', 'accommodation', 'activities', 'duration'] : [])
    ];
    
    // Clean up unused fields and temporary fields
    Object.keys(payload).forEach(key => {
      if (!fieldsToKeep.includes(key) || key === 'startTime' || key === 'endTime') {
        delete payload[key];
      }
    });

    try {
      await onSubmit(payload);
      router.push(`/admin/${type}s`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(`Error submitting ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Common fields for all types
  const commonFields = (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (USD)*</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Origin*</label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Destination*</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Departure Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Departure Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Arrival Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </>
  );

  // Type-specific fields
  const typeSpecificFields = () => {
    switch (type) {
      case 'flight':
        return (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Flight Number</label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Airline</label>
                <input
                  type="text"
                  name="airline"
                  value={formData.airline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Features (comma-separated)</label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="WiFi, Extra Legroom, Meal Service"
              />
            </div>
          </>
        );
      case 'bus':
        return (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                <input
                  type="text"
                  name="busNumber"
                  value={formData.busNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bus Type</label>
                <input
                  type="text"
                  name="busType"
                  value={formData.busType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Luxury, Economy, Express"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amenities (comma-separated)</label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="WiFi, Bathroom, Power Outlets"
              />
            </div>
          </>
        );
      case 'trip':
        return (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trip Type</label>
                <input
                  type="text"
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Adventure, Cultural, Beach, Mountain"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Accommodation</label>
              <input
                type="text"
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Hotel, Hostel, Resort"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Activities (comma-separated)</label>
              <textarea
                name="activities"
                value={formData.activities}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Hiking, City Tour, Beach Activities"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">{isEditMode ? `Edit ${type}` : `Create new ${type}`}</h2>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {commonFields}
        {typeSpecificFields()}
        
        <div className="pt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
} 
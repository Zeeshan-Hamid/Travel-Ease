import { useState } from 'react';
import Link from 'next/link';

export default function DataTable({ 
  data, 
  columns, 
  type,
  onDelete,
  actionPath = '/admin'
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  // Sort function
  const sortedData = () => {
    let sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        if (a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === undefined) return -1;
        
        const aValue = typeof a[sortConfig.key] === 'string' 
          ? a[sortConfig.key].toLowerCase() 
          : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' 
          ? b[sortConfig.key].toLowerCase()
          : b[sortConfig.key];
          
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  // Filter function
  const filteredData = sortedData().filter(item => {
    return columns.some(column => {
      const value = item[column.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort handler
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      setIsDeleting(id);
      try {
        await onDelete(id);
        // The parent component should refresh the data
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Failed to delete ${type}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format cell values
  const formatCellValue = (value, dataType) => {
    if (value === null || value === undefined) return '—';
    
    switch (dataType) {
      case 'date':
        return formatDate(value);
      case 'price':
        return `$${parseFloat(value).toFixed(2)}`;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{type}s</h2>
          <p className="text-sm text-gray-500">{filteredData.length} items total</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pl-10 pr-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <Link 
            href={`${actionPath}/${type}s/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New {type}
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig.key === column.key && (
                      <span>
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={`${item._id}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCellValue(item[column.key], column.dataType)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link 
                      href={`${actionPath}/${type}s/${item._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </Link>
                    <Link 
                      href={`${actionPath}/${type}s/edit/${item._id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={isDeleting === item._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {isDeleting === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No items match your search' : 'No items found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      
    </div>
  );
} 
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Interface for Vapi assistant
interface Assistant {
  id: string;
  name: string;
  voice?: {
    provider: string;
    voiceId?: string;
    language?: string;
  };
  transcriber?: {
    provider: string;
    language: string;
  };
  initial_message?: string;
  firstMessage?: string;
  metadata?: {
    businessId?: string;
    [key: string]: any;
  };
  recording_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  availability?: {
    enabled?: boolean;
    [key: string]: any;
  };
}

const AssistantList: React.FC = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/assistants', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch assistants: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setAssistants(data);
      } catch (err) {
        console.error('Error fetching assistants:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  // Filter assistants by name
  const filteredAssistants = assistants.filter(assistant => 
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="text-sm text-red-700">{error}</div>
        <div className="mt-2">
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Your Assistants</h2>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <div className="flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md focus:outline-none ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md focus:outline-none ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Link
              to="/assistants/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New
            </Link>
          </div>
        </div>

        {filteredAssistants.length === 0 && (
          <div className="text-center py-12 px-4">
            {searchTerm ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">No assistants match your search criteria.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0h-6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assistants</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new assistant.</p>
                <div className="mt-6">
                  <Link
                    to="/assistants/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Assistant
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {filteredAssistants.length > 0 && viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssistants.map((assistant) => (
              <Link
                key={assistant.id}
                to={`/assistants/${assistant.id}`}
                className="group relative block rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300 bg-white border border-gray-200 hover:border-indigo-200"
              >
                <div className={`absolute inset-0 h-1 ${assistant.availability?.enabled !== false ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 truncate">
                      {assistant.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assistant.availability?.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {assistant.availability?.enabled !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="truncate">
                        {assistant.initial_message?.substring(0, 50) || 'No greeting message'}
                        {(assistant.initial_message?.length || 0) > 50 ? '...' : ''}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>
                        Voice: {assistant.voice?.provider || 'Not set'} ({assistant.voice?.language || 'N/A'})
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <div>
                      Created: {new Date(assistant.createdAt || assistant.created_at || '').toLocaleDateString()}
                    </div>
                    <div>
                      <span className="inline-flex items-center text-indigo-600 group-hover:text-indigo-800">
                        Edit
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredAssistants.length > 0 && viewMode === 'list' && (
          <ul className="divide-y divide-gray-200">
            {filteredAssistants.map((assistant) => (
              <li key={assistant.id}>
                <Link
                  to={`/assistants/${assistant.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${assistant.availability?.enabled !== false ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <svg className={`h-6 w-6 ${assistant.availability?.enabled !== false ? 'text-green-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {assistant.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {assistant.initial_message?.substring(0, 60) || 'No greeting message'}
                            {(assistant.initial_message?.length || 0) > 60 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assistant.availability?.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {assistant.availability?.enabled !== false ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Provider: {assistant.voice?.provider || 'Not set'}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Language: {assistant.voice?.language || 'N/A'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          Created on <time>{new Date(assistant.createdAt || assistant.created_at || '').toLocaleDateString()}</time>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssistantList; 
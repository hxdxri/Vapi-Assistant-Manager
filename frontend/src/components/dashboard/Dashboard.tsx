import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  businessName: string | null;
  fullName: string | null;
}

interface Stats {
  totalAssistants: number;
  newAssistants: number;
  availableAssistants: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalAssistants: 0,
    newAssistants: 0,
    availableAssistants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user profile
        const profileResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        setUser(profileData);

        // Fetch assistants to calculate stats
        const assistantsResponse = await fetch('/api/assistants', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!assistantsResponse.ok) {
          throw new Error(`Failed to fetch assistants: ${assistantsResponse.status}`);
        }

        const assistantsData = await assistantsResponse.json();
        
        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newCount = assistantsData.filter((assistant: any) => {
          const createdAt = new Date(assistant.createdAt || assistant.created_at);
          return createdAt >= oneWeekAgo;
        }).length;
        
        const availableCount = assistantsData.filter((assistant: any) => {
          const availability = assistant.availability || {};
          return availability.enabled !== false;
        }).length;
        
        setStats({
          totalAssistants: assistantsData.length,
          newAssistants: newCount,
          availableAssistants: availableCount,
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome, {user?.businessName || user?.fullName || user?.email.split('@')[0]}!
              </h2>
              <p className="mt-2 text-indigo-100">
                Manage your AI voice assistants and enhance your customer interactions
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Manage Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Assistants */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0h-6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assistants</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalAssistants}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/assistants" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all assistants
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* New Assistants */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Assistants (Last 7 days)</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.newAssistants}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/assistants/new" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create new assistant
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Assistants */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Assistants</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.availableAssistants}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/assistants" className="font-medium text-indigo-600 hover:text-indigo-500">
                Manage availability
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 px-6 py-5">
            <div className="group relative rounded-lg p-6 bg-gray-50 hover:bg-indigo-50 transition duration-150 ease-in-out">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-700">
                  <Link to="/assistants/new" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    Create Assistant
                  </Link>
                </h4>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-indigo-600">
                  Set up a new AI voice assistant for your business
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-indigo-400" aria-hidden="true">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </div>

            <div className="group relative rounded-lg p-6 bg-gray-50 hover:bg-indigo-50 transition duration-150 ease-in-out">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0h-6" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-700">
                  <Link to="/assistants" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    Manage Assistants
                  </Link>
                </h4>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-indigo-600">
                  View and edit your existing voice assistants
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-indigo-400" aria-hidden="true">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </div>

            <div className="group relative rounded-lg p-6 bg-gray-50 hover:bg-indigo-50 transition duration-150 ease-in-out">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-700">
                  <Link to="/profile" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"></span>
                    Profile Settings
                  </Link>
                </h4>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-indigo-600">
                  Update your business information and preferences
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-indigo-400" aria-hidden="true">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
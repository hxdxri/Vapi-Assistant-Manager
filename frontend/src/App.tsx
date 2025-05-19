import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AssistantList from './components/assistants/AssistantList';
import AssistantForm from './components/assistants/AssistantForm';
import ProfileForm from './components/profile/ProfileForm';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [userTheme, setUserTheme] = useState<string>('indigo');

  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.theme) {
            setUserTheme(userData.theme);
          }
        }
      } catch (error) {
        console.error('Error fetching user theme:', error);
      }
    };
    
    fetchUserTheme();
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login'; // force redirect
  };

  // Dynamic color classes based on theme
  const themeClasses = {
    indigo: {
      primary: 'bg-indigo-600',
      primaryHover: 'hover:bg-indigo-700',
      primaryText: 'text-indigo-600',
      primaryBorder: 'border-indigo-600',
      gradient: 'from-indigo-500 to-indigo-700',
      sidebar: 'bg-indigo-800',
      sidebarHover: 'hover:bg-indigo-700',
      sidebarActive: 'bg-indigo-900',
    },
    blue: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      primaryText: 'text-blue-600',
      primaryBorder: 'border-blue-600',
      gradient: 'from-blue-500 to-blue-700',
      sidebar: 'bg-blue-800',
      sidebarHover: 'hover:bg-blue-700',
      sidebarActive: 'bg-blue-900',
    },
    emerald: {
      primary: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryText: 'text-emerald-600',
      primaryBorder: 'border-emerald-600',
      gradient: 'from-emerald-500 to-emerald-700',
      sidebar: 'bg-emerald-800',
      sidebarHover: 'hover:bg-emerald-700',
      sidebarActive: 'bg-emerald-900',
    },
    rose: {
      primary: 'bg-rose-600',
      primaryHover: 'hover:bg-rose-700',
      primaryText: 'text-rose-600',
      primaryBorder: 'border-rose-600',
      gradient: 'from-rose-500 to-rose-700',
      sidebar: 'bg-rose-800',
      sidebarHover: 'hover:bg-rose-700',
      sidebarActive: 'bg-rose-900',
    },
    amber: {
      primary: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      primaryText: 'text-amber-600',
      primaryBorder: 'border-amber-600',
      gradient: 'from-amber-500 to-amber-700',
      sidebar: 'bg-amber-800',
      sidebarHover: 'hover:bg-amber-700',
      sidebarActive: 'bg-amber-900',
    },
    violet: {
      primary: 'bg-violet-600',
      primaryHover: 'hover:bg-violet-700',
      primaryText: 'text-violet-600',
      primaryBorder: 'border-violet-600',
      gradient: 'from-violet-500 to-violet-700',
      sidebar: 'bg-violet-800',
      sidebarHover: 'hover:bg-violet-700',
      sidebarActive: 'bg-violet-900',
    },
  };

  const theme = themeClasses[userTheme as keyof typeof themeClasses] || themeClasses.indigo;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {token && (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className={`hidden md:flex md:flex-shrink-0`}>
              <div className={`flex flex-col w-64 ${theme.sidebar}`}>
                <div className="flex items-center h-16 flex-shrink-0 px-4">
                  <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
                  <h1 className="text-xl font-bold text-white">
                    Vapi Assistant Manager
                  </h1>
                </div>
                <div className="h-0 flex-1 flex flex-col overflow-y-auto">
                  <nav className="flex-1 px-2 py-4 space-y-1">
                    <Link
                      to="/dashboard"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white ${window.location.pathname === '/dashboard' ? theme.sidebarActive : theme.sidebarHover}`}
                    >
                      <svg className="mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/assistants"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white ${window.location.pathname.includes('/assistants') ? theme.sidebarActive : theme.sidebarHover}`}
                    >
                      <svg className="mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0h-6" />
                      </svg>
                      Assistants
                    </Link>
                    
                    <Link
                      to="/profile"
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white ${window.location.pathname === '/profile' ? theme.sidebarActive : theme.sidebarHover}`}
                    >
                      <svg className="mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-red-700"
                    >
                      <svg className="mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            {/* Mobile header */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
              <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
                    <h1 className={`text-xl font-bold ${theme.primaryText}`}>
                      Vapi Assistant Manager
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2 mr-4">
                    <Link
                      to="/dashboard"
                      className={`p-2 rounded-md text-gray-600 hover:text-gray-900 ${window.location.pathname === '/dashboard' && theme.primaryText}`}
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </Link>
                    <Link
                      to="/assistants"
                      className={`p-2 rounded-md text-gray-600 hover:text-gray-900 ${window.location.pathname.includes('/assistants') && theme.primaryText}`}
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0h-6" />
                      </svg>
                    </Link>
                    <Link
                      to="/profile"
                      className={`p-2 rounded-md text-gray-600 hover:text-gray-900 ${window.location.pathname === '/profile' && theme.primaryText}`}
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-md text-gray-600 hover:text-red-600"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      token ? (
                        <Dashboard />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/assistants"
                    element={
                      token ? (
                        <AssistantList />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/assistants/new"
                    element={
                      token ? (
                        <AssistantForm />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/assistants/:id"
                    element={
                      token ? (
                        <AssistantForm />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      token ? (
                        <ProfileForm />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/"
                    element={
                      token ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                </Routes>
              </main>
            </div>
          </div>
        )}

        {!token && (
          <Routes>
            <Route
              path="/login"
              element={
                !token ? (
                  <LoginForm onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !token ? (
                  <RegisterForm onRegister={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App; 
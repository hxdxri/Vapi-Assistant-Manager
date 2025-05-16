import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AssistantList from './components/assistants/AssistantList';
import AssistantForm from './components/assistants/AssistantForm';

const App: React.FC = () => {
  const [token, setToken] = React.useState<string | null>(
    localStorage.getItem('token')
  );

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {token && (
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-indigo-600">
                      Vapi Assistant Manager
                    </h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleLogout}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/login"
              element={
                !token ? (
                  <LoginForm onLogin={handleLogin} />
                ) : (
                  <Navigate to="/assistants" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !token ? (
                  <RegisterForm onRegister={handleLogin} />
                ) : (
                  <Navigate to="/assistants" replace />
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
              path="/"
              element={
                token ? (
                  <Navigate to="/assistants" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 
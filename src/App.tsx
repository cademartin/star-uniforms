import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { scheduleWeeklyBackup } from './utils/backup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  useEffect(() => {
    scheduleWeeklyBackup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="production" element={<Production />} />
              <Route path="sales" element={<Sales />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
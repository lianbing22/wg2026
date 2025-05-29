// routes/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/DashboardPage'; // Import the actual DashboardPage

// Mock authentication check
const isAuthenticated = () => {
  // Replace with actual auth check, e.g., from localStorage or context
  return localStorage.getItem('authToken') !== null;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage /> {/* Use the actual DashboardPage component */}
          </ProtectedRoute>
        }
      />
      {/* Add other routes here */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
// routes/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react'; // Import ReactNode for children prop
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/DashboardPage'; // Import the actual DashboardPage
import PropertyListPage from '../pages/Property/PropertyListPage'; // 新增物业列表页面导入
import PropertyDetailPage from '../pages/Property/PropertyDetailPage'; // 新增物业详情页面导入

// Mock authentication check
const isAuthenticated = () => {
  // Replace with actual auth check, e.g., from localStorage or context
  return localStorage.getItem('authToken') !== null;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
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
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <PropertyListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <ProtectedRoute>
            <PropertyDetailPage />
          </ProtectedRoute>
        }
      />
      {/* Add other routes here */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
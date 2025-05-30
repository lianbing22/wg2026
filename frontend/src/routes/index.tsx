import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PropertyListPage from '../pages/Property/PropertyListPage';
import PropertyDetailPage from '../pages/Property/PropertyDetailPage';
import ScenarioSelectionPage from '../pages/Game/ScenarioSelectionPage';
import GameScenarioPage from '../pages/Game/GameScenarioPage';
import CharacterCreationPage from '../pages/Game/CharacterCreationPage';
import GameSettingsPage from '../pages/Game/GameSettingsPage';
import AchievementsPage from '../pages/Game/AchievementsPage';

// 简单的认证检查
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>出错了！</h1>
      <p>页面加载时发生错误，请刷新页面重试。</p>
      <button onClick={() => window.location.reload()}>刷新页面</button>
    </div>,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'properties',
        element: (
          <ProtectedRoute>
            <PropertyListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'properties/:id',
        element: (
          <ProtectedRoute>
            <PropertyDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'game',
        children: [
          {
             path: 'character-creation',
             element: (
               <ProtectedRoute>
                 <CharacterCreationPage />
               </ProtectedRoute>
             ),
           },
           {
              path: 'settings',
              element: (
                <ProtectedRoute>
                  <GameSettingsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'achievements',
              element: (
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              ),
            },
          {
            path: 'scenarios',
            element: (
              <ProtectedRoute>
                <ScenarioSelectionPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'scenario/:scenarioId',
            element: (
              <ProtectedRoute>
                <GameScenarioPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '*',
        element: <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>404 - 页面未找到</h1>
          <p>您访问的页面不存在。</p>
          <button onClick={() => window.location.href = '/'}>返回首页</button>
        </div>,
      },
    ],
  },
], {
  basename: '/wg2026'
});
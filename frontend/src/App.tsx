import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GameScenarioPage from './pages/Game/GameScenarioPage';
import AchievementsPage from './pages/Game/AchievementsPage';
import GameSettingsPage from './pages/Game/GameSettingsPage';
import ScenarioSelectionPage from './pages/Game/ScenarioSelectionPage';
import PropertyDetailPage from './pages/Property/PropertyDetailPage';
import PropertyListPage from './pages/Property/PropertyListPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/game/scenario" element={<GameScenarioPage />} />
          <Route path="/game/achievements" element={<AchievementsPage />} />
          <Route path="/game/settings" element={<GameSettingsPage />} />
          <Route path="/game/scenario-selection" element={<ScenarioSelectionPage />} />
          <Route path="/property/detail" element={<PropertyDetailPage />} />
          <Route path="/property/list" element={<PropertyListPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;

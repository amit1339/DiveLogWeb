import React from 'react';
import DivesList from './features/modal/DivesList.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <span className="material-icons-round header-icon">scuba_diving</span>
          <h1>Dive Log</h1>
        </div>
        <p className="header-subtitle">Track &amp; visualize your underwater adventures</p>
        <div className="wave-divider">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,25 C360,50 720,0 1080,25 C1260,37.5 1350,37.5 1440,25 L1440,50 L0,50 Z"
              fill="var(--ocean-dark)"
            />
          </svg>
        </div>
      </header>
      <main>
        <DivesList />
      </main>
    </div>
  );
}

export default App;

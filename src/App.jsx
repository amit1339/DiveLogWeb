import React from 'react';
import DivesList from './features/dives/DivesList.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dive Log</h1>
      </header>
      <main>
        <DivesList />
      </main>
    </div>
  );
}

export default App;

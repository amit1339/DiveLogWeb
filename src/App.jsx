import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setUser, logoutUser } from './features/auth/authSlice';
import { Link } from 'react-router-dom';
import DivesList from './features/modal/DivesList.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, authInitialized } = useSelector((state) => state.auth);
  
  if (!authInitialized) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Simple placeholder for Profile until we build it fully
const ProfilePlaceholder = () => (
  <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
    <span className="material-icons-round" style={{ fontSize: '64px', color: 'var(--biolum-cyan)' }}>person</span>
    <h2>User Profile</h2>
    <p>Coming soon...</p>
    <a href="#/" style={{ color: 'var(--biolum-cyan)', textDecoration: 'none' }}>Back to Dives</a>
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Area */}
        <Route path="/*" element={
          <ProtectedRoute>
            <header className="App-header">
              <div className="header-top-row">
                <div className="header-content">
                  <span className="material-icons-round header-icon">scuba_diving</span>
                  <h1>Dive Log</h1>
                </div>
                <div className="header-actions">
                  <Link to="/profile" className="header-action-btn">
                    <span className="material-icons-round">account_circle</span>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="header-action-btn logout-btn">
                    <span className="material-icons-round">logout</span>
                    Logout
                  </button>
                </div>
              </div>
              <p className="header-subtitle">Track &amp; visualize your underwater adventures</p>
              
              {/* Add Profile Link in Header later, for now just wave divider */}
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
              <Routes>
                <Route path="/" element={<DivesList />} />
                <Route path="/profile" element={<ProfilePlaceholder />} />
              </Routes>
            </main>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;

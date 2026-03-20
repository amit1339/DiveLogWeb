import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDives, selectDives, selectDivesStatus } from '../slice/divesSlice';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import './Profile.css';

const parseDate = (val) => {
  if (!val) return new Date(NaN);
  if (val.seconds !== undefined) return new Date(val.seconds * 1000);
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0m 0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const Profile = () => {
  const dispatch = useDispatch();
  const dives = useSelector(selectDives);
  const status = useSelector(selectDivesStatus);
  const { user } = useSelector((state) => state.auth);
  
  const [buddies, setBuddies] = useState([]);

  useEffect(() => {
    if (status === 'idle' && user) {
      dispatch(fetchDives(user.uid));
    }
  }, [status, dispatch, user]);

  useEffect(() => {
    // Fetch a few other users to show as 'Buddies'
    const fetchBuddies = async () => {
      try {
        const q = query(collection(db, 'users'), limit(5));
        const snapshot = await getDocs(q);
        const usersList = [];
        snapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            usersList.push({ id: doc.id, ...doc.data() });
          }
        });
        setBuddies(usersList);
      } catch (err) {
        console.error("Error fetching buddies:", err);
      }
    };
    if (user) fetchBuddies();
  }, [user]);

  const stats = useMemo(() => {
    if (!dives.length) return null;

    let totalDuration = 0;
    let longestDive = 0;
    let totalMaxDepth = 0;
    let deepestDive = 0;
    
    // We assume waterTemp might exist; if not, we won't calculate min/max easily, 
    // but let's look for a waterTemp or temperature field.
    let coldest = Infinity;
    let warmest = -Infinity;

    dives.forEach(dive => {
      // Duration
      let durationSec = 0;
      if (dive.bottomTimeSeconds) {
        durationSec = dive.bottomTimeSeconds;
      } else if (dive.startTime && dive.endTime) {
        const start = parseDate(dive.startTime);
        const end = parseDate(dive.endTime);
        durationSec = Math.max(0, Math.floor((end - start) / 1000));
      }
      
      totalDuration += durationSec;
      if (durationSec > longestDive) longestDive = durationSec;

      // Depth
      const depth = Number(dive.maxDepthMeters || dive.maxDepth || 0);
      totalMaxDepth += depth;
      if (depth > deepestDive) deepestDive = depth;

      // Temp handling
      const temp = Number(dive.waterTemp || dive.temperature);
      if (!isNaN(temp)) {
        if (temp < coldest) coldest = temp;
        if (temp > warmest) warmest = temp;
      }
    });

    const averageDuration = Math.round(totalDuration / dives.length);
    const averageMaxDepth = (totalMaxDepth / dives.length).toFixed(1);

    return {
      totalDives: dives.length,
      averageDuration: formatDuration(averageDuration),
      longestDive: formatDuration(longestDive),
      averageMaxDepth: `${averageMaxDepth}m`,
      deepestDive: `${deepestDive.toFixed(1)}m`,
      coldestDive: coldest !== Infinity ? `${coldest}°C` : 'N/A',
      warmestDive: warmest !== -Infinity ? `${warmest}°C` : 'N/A'
    };
  }, [dives]);

  // Static mockup data for Certs and Gear
  const certifications = ['Open Water Diver', 'Advanced Open Water', 'Deep Diver Specialty'];
  const gear = ['Scubapro MK25 EVO / S600', 'Suunto D5 Computer', 'Aqualung BCD', 'Mares Avanti Quattro+'];

  return (
    <div className="profile-container">
      
      {/* Header / Avatar */}
      <div className="profile-header">
        <div className="avatar-circle">
          <span className="material-icons-round">person</span>
        </div>
        <div className="profile-info">
          <h2>{user?.displayName || 'Diver'}</h2>
          <p>{user?.email}</p>
        </div>
        <Link to="/" className="back-link">
          <span className="material-icons-round">arrow_back</span>
          Back to Dives
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="profile-section">
        <h3 className="section-title">
          <span className="material-icons-round">analytics</span>
          Dive Statistics
        </h3>
        {stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Dives</span>
              <span className="stat-value text-cyan">{stats.totalDives}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Duration</span>
              <span className="stat-value">{stats.averageDuration}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Longest Dive</span>
              <span className="stat-value">{stats.longestDive}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Max Depth</span>
              <span className="stat-value">{stats.averageMaxDepth}</span>
            </div>
            <div className="stat-card highlight-card">
              <span className="stat-label">Deepest Dive</span>
              <span className="stat-value text-pink">{stats.deepestDive}</span>
            </div>
            <div className="stat-card temp-card">
              <span className="stat-label">Coldest</span>
              <span className="stat-value text-blue">{stats.coldestDive}</span>
            </div>
            <div className="stat-card temp-card">
              <span className="stat-label">Warmest</span>
              <span className="stat-value text-orange">{stats.warmestDive}</span>
            </div>
          </div>
        ) : (
          <div className="empty-stats">Log some dives to see your statistics!</div>
        )}
      </div>

      <div className="profile-bottom-panels">
        {/* Certifications & Gear */}
        <div className="panel-column">
          <div className="profile-panel">
            <h3 className="panel-title">
              <span className="material-icons-round">verified</span>
              Certifications
            </h3>
            <ul className="info-list">
              {certifications.map((cert, i) => (
                <li key={i}><span className="material-icons-round list-icon">done</span>{cert}</li>
              ))}
            </ul>
          </div>
          
          <div className="profile-panel">
            <h3 className="panel-title">
              <span className="material-icons-round">hardware</span>
              Gear Library
            </h3>
            <ul className="info-list">
              {gear.map((item, i) => (
                <li key={i}><span className="material-icons-round list-icon">inventory_2</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buddies */}
        <div className="panel-column">
          <div className="profile-panel buddies-panel">
            <h3 className="panel-title">
              <span className="material-icons-round">group</span>
              Buddies at divelogs
            </h3>
            {buddies.length > 0 ? (
              <div className="buddies-list">
                {buddies.map(buddy => (
                  <div key={buddy.id} className="buddy-item">
                    <div className="buddy-avatar">
                      {buddy.displayName?.charAt(0).toUpperCase() || buddy.email?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <div className="buddy-details">
                      <span className="buddy-name">{buddy.displayName || 'Anonymous Diver'}</span>
                      <span className="buddy-email">{buddy.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No buddies found yet.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;

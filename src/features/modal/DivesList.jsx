import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDives, selectDives, selectDivesStatus } from '../slice/divesSlice';
import './DivesList.css';
import DiveModal from './DiveModal';

const parseDate = (val) => {
  if (!val) return new Date(NaN);
  if (val.seconds !== undefined) return new Date(val.seconds * 1000);
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
};

const formatDate = (dateVal) => {
  try {
    const d = parseDate(dateVal);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateVal);
  }
};

const formatTime = (dateVal) => {
  try {
    const d = parseDate(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const toDateStr = (dateVal) => {
  try {
    const d = parseDate(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

const SkeletonCards = () => (
  <div className="dives-grid">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="dive-card dive-card-skeleton">
        <div className="skeleton-bar skeleton-title" />
        <div className="skeleton-bar skeleton-subtitle" />
        <div className="skeleton-stats">
          <div className="skeleton-bar skeleton-stat" />
          <div className="skeleton-bar skeleton-stat" />
        </div>
      </div>
    ))}
  </div>
);

const DivesList = () => {
  const dispatch = useAppDispatch();
  const dives = useAppSelector(selectDives);
  const status = useAppSelector(selectDivesStatus);
  const [selectedDive, setSelectedDive] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleDiveClick = (dive) => {
    setSelectedDive(dive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDive(null);
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSortBy('date-desc');
  };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDives());
    }
  }, [status, dispatch]);

  // Filtered + sorted dives
  const filteredDives = useMemo(() => {
    let result = [...dives];

    // Search — match dive id/number or location
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(dive => {
        const idStr = String(dive.id).toLowerCase();
        const loc = (dive.location || '').toLowerCase();
        const site = (dive.divesite || '').toLowerCase();
        return idStr.includes(q) || loc.includes(q) || site.includes(q);
      });
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(dive => {
        const d = toDateStr(dive.startTime);
        return d >= dateFrom;
      });
    }
    if (dateTo) {
      result = result.filter(dive => {
        const d = toDateStr(dive.startTime);
        return d <= dateTo;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.startTime) - new Date(b.startTime);
        case 'date-desc':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'number-asc':
          return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        case 'number-desc':
          return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
        default:
          return 0;
      }
    });

    return result;
  }, [dives, searchQuery, dateFrom, dateTo, sortBy]);

  const maxDepthOverall = dives.length > 0 ? Math.max(...dives.map(d => d.maxDepthMeters || 0)) : 40;
  const hasActiveFilters = searchQuery || dateFrom || dateTo || sortBy !== 'date-desc';

  return (
    <div className="dive-log-container">
      <div className="section-header">
        <div className="section-header-left">
          <span className="material-icons-round section-icon">history</span>
          <h2>Your Dives</h2>
        </div>
        <span className="dive-count">{filteredDives.length} of {dives.length} dive{dives.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search & filter bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="material-icons-round search-icon">search</span>
          <input
            type="text"
            placeholder="Search by dive number or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <span className="material-icons-round">close</span>
            </button>
          )}
        </div>

        <div className="filter-actions">
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="material-icons-round">tune</span>
            Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>

          <div className="sort-select-wrapper">
            <span className="material-icons-round sort-icon">sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="number-desc">Number ↓</option>
              <option value="number-asc">Number ↑</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">
              <span className="material-icons-round">calendar_today</span>
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="filter-date-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              <span className="material-icons-round">event</span>
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="filter-date-input"
            />
          </div>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <span className="material-icons-round">filter_alt_off</span>
              Clear All
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <SkeletonCards />}
      {status === 'failed' && (
        <div className="error-state">
          <span className="material-icons-round error-icon">error_outline</span>
          <p>Unable to load dives. Please try again.</p>
        </div>
      )}

      {status !== 'loading' && filteredDives.length === 0 && dives.length > 0 && (
        <div className="empty-filter-state">
          <span className="material-icons-round">filter_list_off</span>
          <p>No dives match your filters</p>
          <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      {status !== 'loading' && (
        <div className="dives-grid">
          {filteredDives.map((dive, index) => {
            const depthPercent = maxDepthOverall > 0 ? ((dive.maxDepthMeters || 0) / maxDepthOverall) * 100 : 0;
            return (
              <div
                key={dive.id}
                className="dive-card"
                style={{ animationDelay: `${index * 0.06}s` }}
                onClick={() => handleDiveClick(dive)}
              >
                <div className="card-depth-bar" style={{ height: `${depthPercent}%` }} />
                <span className="card-dive-number">#{dive.id}</span>
                <div className="card-content">
                  <div className="card-top">
                    <span className="card-date">{formatDate(dive.startTime)}</span>
                    <span className="card-time">{formatTime(dive.startTime)}</span>
                  </div>
                  <div className="card-location">
                    <span className="material-icons-round card-loc-icon">place</span>
                    {dive.location ?? dive.divesite ?? 'Unknown Site'}
                  </div>
                  <div className="card-stats">
                    <div className="card-stat">
                      <span className="material-icons-round">arrow_downward</span>
                      <div>
                        <span className="stat-value">{dive.maxDepthMeters != null ? Number(dive.maxDepthMeters).toFixed(1) : '—'}m</span>
                        <span className="stat-label">Max Depth</span>
                      </div>
                    </div>
                    <div className="card-stat">
                      <span className="material-icons-round">timer</span>
                      <div>
                        <span className="stat-value">{formatDuration(dive.totalBottomTimeSec)}</span>
                        <span className="stat-label">Bottom Time</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-badges">
                    {dive.safetyStopCompleted && (
                      <span className="badge badge-safe">
                        <span className="material-icons-round">verified_user</span>
                        Safety Stop
                      </span>
                    )}
                    {dive.heartRateAvg && (
                      <span className="badge badge-hr">
                        <span className="material-icons-round">favorite</span>
                        {dive.heartRateAvg} bpm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <DiveModal dive={selectedDive} onClose={handleCloseModal} />}
    </div>
  );
};

export default DivesList;

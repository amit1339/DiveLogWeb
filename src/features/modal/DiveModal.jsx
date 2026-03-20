import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import './DiveModal.css';

/* ---- Helpers ---- */
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
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatDepth = (val) => {
  if (val == null) return '—';
  return Number(val).toFixed(1);
};

/* ---- Bubble background ---- */
const Bubbles = () => {
  const bubbles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 14,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.3,
    })), []);

  return (
    <div className="bubbles-container" aria-hidden="true">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="bubble"
          style={{
            width: b.size, height: b.size,
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  );
};

/* ---- Stat chip ---- */
const QuickStat = ({ icon, label, value, accent }) => (
  <div className={`quick-stat ${accent || ''}`}>
    <span className="material-icons-round quick-stat-icon">{icon}</span>
    <div>
      <span className="quick-stat-value">{value}</span>
      <span className="quick-stat-label">{label}</span>
    </div>
  </div>
);

/* ---- Detail row ---- */
const DetailRow = ({ icon, label, value }) => (
  <div className="detail-row">
    <span className="material-icons-round detail-row-icon">{icon}</span>
    <span className="detail-row-label">{label}</span>
    <span className="detail-row-value">{value}</span>
  </div>
);

/* ---- Depth gauge ---- */
const DepthGauge = ({ maxDepth, avgDepth }) => {
  const maxScale = 60; // meters for full gauge
  const maxPercent = Math.min(((maxDepth || 0) / maxScale) * 100, 100);
  const avgPercent = Math.min(((avgDepth || 0) / maxScale) * 100, 100);

  return (
    <div className="depth-gauge">
      <div className="depth-gauge-header">
        <span className="material-icons-round">straighten</span>
        <span>Depth Profile</span>
      </div>
      <div className="depth-gauge-bar-wrapper">
        <div className="depth-gauge-track">
          <div className="depth-gauge-fill depth-gauge-max" style={{ height: `${maxPercent}%` }}>
            <span className="depth-gauge-label">{formatDepth(maxDepth)}m</span>
          </div>
          <div className="depth-gauge-fill depth-gauge-avg" style={{ height: `${avgPercent}%` }}>
            <span className="depth-gauge-label">{formatDepth(avgDepth)}m</span>
          </div>
        </div>
        <div className="depth-gauge-legend">
          <div className="legend-item"><span className="legend-dot max" />Max</div>
          <div className="legend-item"><span className="legend-dot avg" />Avg</div>
        </div>
      </div>
      <div className="depth-surface-label">Surface</div>
    </div>
  );
};

/* ---- Heart rate indicator ---- */
const HeartRate = ({ avg, max }) => (
  <div className="hr-section">
    <div className="hr-header">
      <span className="material-icons-round hr-heart-icon">favorite</span>
      <span>Heart Rate</span>
    </div>
    <div className="hr-values">
      <div className="hr-value-block">
        <span className="hr-number">{avg ?? '—'}</span>
        <span className="hr-unit">avg bpm</span>
      </div>
      <div className="hr-divider" />
      <div className="hr-value-block">
        <span className="hr-number hr-max">{max ?? '—'}</span>
        <span className="hr-unit">max bpm</span>
      </div>
    </div>
  </div>
);

/* ---- Photo Upload ---- */
const PhotoUpload = () => {
  const [photos, setPhotos] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          url: e.target.result,
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="photo-upload-section">
      <h3 className="panel-title">
        <span className="material-icons-round">photo_camera</span>
        Dive Photos
      </h3>

      <div
        className={`photo-dropzone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="material-icons-round dropzone-icon">
          {isDragging ? 'downloading' : 'add_photo_alternate'}
        </span>
        <p className="dropzone-text">
          {isDragging ? 'Drop photos here' : 'Click or drag photos here'}
        </p>
        <span className="dropzone-hint">JPG, PNG, WebP</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="photo-file-input"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-thumb">
              <img src={photo.url} alt={photo.name} />
              <button
                className="photo-remove"
                onClick={() => removePhoto(photo.id)}
                aria-label="Remove photo"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===== MAIN MODAL ===== */
const DiveModal = ({ dive, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!dive) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <Bubbles />

        {/* Close */}
        <button onClick={onClose} className="close-button" aria-label="Close">
          <span className="material-icons-round">close</span>
        </button>

        {/* Header */}
        <div className="modal-hero">
          <div className="modal-hero-top">
            <span className="material-icons-round hero-icon">scuba_diving</span>
            <div>
              <h2 className="modal-title">
                {dive.location || dive.divesite || `Dive #${dive.id}`}
              </h2>
              <p className="modal-subtitle">
                {formatDate(dive.startTime)} &middot; {formatTime(dive.startTime)} — {formatTime(dive.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="quick-stats-bar" style={{ animationDelay: '0.15s' }}>
          <QuickStat icon="arrow_downward" label="Max Depth" value={`${formatDepth(dive.maxDepthMeters)}m`} accent="accent-cyan" />
          <QuickStat icon="timer" label="Bottom Time" value={formatDuration(dive.totalBottomTimeSec)} accent="accent-teal" />
          <QuickStat icon="water" label="Avg Depth" value={`${formatDepth(dive.avgDepthMeters)}m`} accent="accent-purple" />
          <QuickStat
            icon="verified_user"
            label="Safety Stop"
            value={dive.safetyStopCompleted ? 'Completed' : 'Skipped'}
            accent={dive.safetyStopCompleted ? 'accent-teal' : 'accent-pink'}
          />
        </div>

        {/* Body panels */}
        <div className="modal-panels">
          {/* Left column */}
          <div className="panel-column">
            {/* Dive Info panel */}
            <div className="glass-panel" style={{ animationDelay: '0.25s' }}>
              <h3 className="panel-title">
                <span className="material-icons-round">info</span>
                Dive Information
              </h3>
              <div className="detail-rows">
                <DetailRow icon="place" label="Location" value={dive.location ?? 'N/A'} />
                <DetailRow icon="flag" label="Dive Site" value={dive.divesite ?? 'N/A'} />
                <DetailRow icon="group" label="Buddy" value={dive.buddy ?? 'N/A'} />
                <DetailRow icon="schedule" label="Start" value={`${formatDate(dive.startTime)} ${formatTime(dive.startTime)}`} />
                <DetailRow icon="schedule" label="End" value={`${formatDate(dive.endTime)} ${formatTime(dive.endTime)}`} />
              </div>
            </div>

            {/* Conditions panel */}
            <div className="glass-panel" style={{ animationDelay: '0.35s' }}>
              <h3 className="panel-title">
                <span className="material-icons-round">cloud</span>
                Conditions
              </h3>
              <div className="detail-rows">
                <DetailRow icon="wb_sunny" label="Weather" value={dive.weather ?? 'N/A'} />
                <DetailRow icon="visibility" label="Visibility" value={dive.visibility ?? 'N/A'} />
              </div>
            </div>

            {/* Notes panel */}
            {dive.notes && (
              <div className="glass-panel" style={{ animationDelay: '0.45s' }}>
                <h3 className="panel-title">
                  <span className="material-icons-round">edit_note</span>
                  Notes
                </h3>
                <p className="notes-text">{dive.notes}</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="panel-column">
            {/* Depth gauge */}
            <div className="glass-panel" style={{ animationDelay: '0.3s' }}>
              <DepthGauge maxDepth={dive.maxDepthMeters} avgDepth={dive.avgDepthMeters} />
            </div>

            {/* Heart rate */}
            {(dive.heartRateAvg || dive.heartRateMax) && (
              <div className="glass-panel" style={{ animationDelay: '0.4s' }}>
                <HeartRate avg={dive.heartRateAvg} max={dive.heartRateMax} />
              </div>
            )}
          </div>
        </div>

        {/* Photo upload */}
        <div className="modal-photo-section">
          <div className="glass-panel" style={{ animationDelay: '0.5s' }}>
            <PhotoUpload />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiveModal;

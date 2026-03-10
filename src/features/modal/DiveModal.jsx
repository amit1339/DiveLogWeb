import React from 'react';
import './DiveModal.css';
import DiveLog from './DiveLog.png';

const DiveDetail = ({ label, value }) => (
    <div className="dive-detail">
        <span className="dive-detail-label">{label}:</span> {value}
    </div>
);

const DiveModal = ({ dive, onClose }) => {
    if (!dive) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Dive #{dive.id} - {new Date(dive.startTime).toLocaleDateString()}</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="dive-details-left">
                        <DiveDetail label="Location" value={dive.location ?? 'N/A'} />
                        <DiveDetail label="Divesite" value={dive.divesite ?? 'N/A'} />
                        <DiveDetail label="Buddy" value={dive.buddy ?? 'N/A'} />
                        <DiveDetail label="Start Time" value={dive.startTime} />
                        <DiveDetail label="End Time" value={dive.endTime} />
                        <DiveDetail label="Bottom Time" value={`${dive.totalBottomTimeSec}s`} />
                        <DiveDetail label="Weather" value={dive.weather ?? 'N/A'} />
                        <DiveDetail label="Visibility" value={dive.visibility ?? 'N/A'} />
                        <DiveDetail label="Max Depth" value={`${dive.maxDepthMeters}m`} />
                        <DiveDetail label="Avg Depth" value={`${dive.avgDepthMeters}m`} />
                        <DiveDetail label="Avg HR" value={dive.heartRateAvg ?? 'N/A'} />
                        <DiveDetail label="Max HR" value={dive.heartRateMax ?? 'N/A'} />
                        <DiveDetail label="Safety Stop" value={dive.safetyStopCompleted ? 'Yes' : 'No'} />
                    </div>
                    <div className="dive-details-right">
                        <div className="tank-details">
                            <h3>Tank Data</h3>
                            <img src={DiveLog} alt="Dive Tank" />
                            {/* Add more tank data details here */}
                        </div>
                        <div className='notes-section'>
                            <h3>Notes:</h3>
                            <p>{dive.notes}</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="image-upload-section">
                        <h3>Upload Pictures</h3>
                        <input type="file" multiple />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiveModal;

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDives, selectDives, selectDivesStatus } from './divesSlice';
import './DivesList.css';
import DiveModal from './DiveModal';

const DivesList = () => {
  const dispatch = useAppDispatch();
  const dives = useAppSelector(selectDives);
  const status = useAppSelector(selectDivesStatus);
  const [selectedDive, setSelectedDive] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDiveClick = (dive) => {
    setSelectedDive(dive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDive(null);
    setIsModalOpen(false);
  };


  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDives());
    }
  }, [status, dispatch]);

  return (
    <div className="dive-log-container">
      <h2>Dive Log</h2>
      <p>Status: {status}</p>
      <p>Dives found: {dives.length}</p>
      
      {status === 'loading' && <div>Loading dives...</div>}
      {status === 'failed' && <div>Error loading dives.</div>}
      
      <table className="dive-log-table">
        <thead>
          <tr>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Max Depth (m)</th>
            <th>Avg Depth (m)</th>
            <th>Bottom Time (s)</th>
            <th>Avg HR</th>
            <th>Max HR</th>
            <th>Safety Stop</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {dives.map((dive) => (
            <tr key={dive.id} onClick={() => handleDiveClick(dive)}>
              <td>{dive.startTime}</td>
              <td>{dive.endTime}</td>
              <td>{dive.maxDepthMeters}</td>
              <td>{dive.avgDepthMeters}</td>
              <td>{dive.totalBottomTimeSec}</td>
              <td>{dive.heartRateAvg ?? 'N/A'}</td>
              <td>{dive.heartRateMax ?? 'N/A'}</td>
              <td>{dive.safetyStopCompleted ? 'Yes' : 'No'}</td>
              <td>{dive.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && <DiveModal dive={selectedDive} onClose={handleCloseModal} />}
    </div>
  );
};

export default DivesList;

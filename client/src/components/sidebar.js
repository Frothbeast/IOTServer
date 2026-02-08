import React from 'react';
import SumpChart from '../sumpChart';
import './sidebar.css'; 

const Sidebar = ({ isOpen, sumpRecords }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="chartContainer1">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "Ladc", color: "pink", data: sumpRecords.map(r => r.payload?.Ladc) },
                     { label: "Hadc", color: "green", data: sumpRecords.map(r => r.payload?.Hadc) }]} 
        />
      </div>
      <div className="chartContainer2">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "timeOn", color: "yellow", data: sumpRecords.map(r => r.payload?.timeOn) },
                     { label: "timeOff", color: "red", data: sumpRecords.map(r => r.payload?.timeOff) }]} 
        />
      </div>
      <div className="chartContainer3">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "duty", color: "green", data: sumpRecords.map(r => r.payload?.duty) }]} 
        />
      </div>
      <div className="chartContainer4">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "period", color: "red", data: sumpRecords.map(r => r.payload?.duty) }]} 
        />
      </div>
    </div>
  );
};

export default Sidebar;
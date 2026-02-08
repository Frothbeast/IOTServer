import React from 'react';
import SumpChart from './sumpChart';
import './sidebar.css'; 

const Sidebar = ({ isOpen, sumpRecords }) => {
  const sidebarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: true,
          position: 'top', 
          align: 'start',   
          labels: {
            boxWidth: 20,
            boxHeight: 2,
            padding: 1,
            font: {size: 18}
          }
        } 
      },
      scales: {
        x: { display: true }, // Example: Show X axis in sidebar but not in control bar
        y: { display: false, grace: '10%' }
      }
    };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="chartContainer1">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "Ladc", color: "pink", data: sumpRecords.map(r => r.payload?.Ladc) },
                     { label: "Hadc", color: "green", data: sumpRecords.map(r => r.payload?.Hadc) }]} 
          options={sidebarChartOptions}           
        />
      </div>
      <div className="chartContainer2">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "timeOn", color: "yellow", data: sumpRecords.map(r => r.payload?.timeOn) },
                     { label: "timeOff", color: "red", data: sumpRecords.map(r => r.payload?.timeOff) }]} 
          options={sidebarChartOptions}
        />
      </div>
      <div className="chartContainer3">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "duty", color: "green", data: sumpRecords.map(r => r.payload?.duty) }]}
          options={sidebarChartOptions} 
        />
      </div>
      <div className="chartContainer4">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "period", color: "red", data: sumpRecords.map(r => r.payload?.duty) }]} 
          options={sidebarChartOptions}
        />
      </div>
    </div>
  );
};

export default Sidebar;
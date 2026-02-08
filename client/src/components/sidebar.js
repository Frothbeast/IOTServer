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
            boxWidth: 40,
            boxHeight: 2,
            padding: 1,
            font: {size: 22},
            color: 'lightgrey'
          }
        } 
      },
      scales: {
        x: { display: false }, 
        y: { display: true, ticks: {color: 'grey'}, grace: '10%',grid: {
            color: 'rgba(255, 255, 255, 0.42)' 
          }
        }
      }

    };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="chartContainer1">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{ label: "Ladc", color: "pink", data: sumpRecords.map(r => r.payload?.Ladc) },
                     { label: "Hadc", color: "lightgreen", data: sumpRecords.map(r => r.payload?.Hadc) }]} 
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
          datasets={[{ label: "duty", color: "lightgreen", data: sumpRecords.map(r => r.payload?.duty) }]}
          options={sidebarChartOptions} 
        />
      </div>
      <div className="chartContainer4">
        <SumpChart
          labels={sumpRecords.map((_, i) => i)}
          datasets={[{
            label: "period",color: "red",
            data: sumpRecords.slice(1).map((r, i) => {
              const current = new Date(r.payload?.datetime).getTime();
              const previous = new Date(sumpRecords[i].payload?.datetime).getTime();
              return ( previous -current) / 60000;
            })
            }
          ]}
          options={sidebarChartOptions}
        />
      </div>
    </div>
  );
};

export default Sidebar;

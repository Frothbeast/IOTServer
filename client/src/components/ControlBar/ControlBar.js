import SumpChart from '../sumpChart';
import './ControlBar.css';

const ControlBar = ({ selectedHours, onHoursChange, columnStats, sumpRecords, toggleSidebar, isSidebarOpen }) => {
  const controlBarChartOptions = ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true,
        position: 'top', 
        align: 'start',   
        labels: {
          boxWidth: 10,
          boxHeight: 2,
          padding: 1,
          font: {size: 10}
        }
      } 
    },
    layout: {
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    scales: {
      x: { display: false },
      y: {display: false,
        grace: '10%'
      }
    }
  })
  
  return (
    <header className="controlBar">
      <div className="brand">Sump</div>
      <select className="selectedHours" value={selectedHours} onChange={(e) => onHoursChange(Number(e.target.value))}>
        <option value={1}>Hour</option>
        <option value={24}>Day</option>
        <option value={168}>Week</option>
      </select>
        
      <div className="chartContainer1">
        <SumpChart 
          labels={sumpRecords.map((_, i) => i)}
            datasets={[
              { 
                label: "Ladc", 
                color: "pink", 
                data: sumpRecords.map(r => r.payload?.Ladc),
              },
             { 
                label: "Hadc", 
                color: "green", 
                data: sumpRecords.map(r => r.payload?.Hadc),
              }
            ]}
            options={controlBarChartOptions}  
          />
        </div>
        <div className="chartContainer2">
          <SumpChart 
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              { 
                label: "timeOn", 
                color: "yellow", 
                data: sumpRecords.map(r => r.payload?.timeOn), 
              },
              { 
                label: "timeOff", 
                color: "red", 
                data: sumpRecords.map(r => r.payload?.timeOff),  
              } 
            ]} 
            options={controlBarChartOptions}  
          />
        </div>
        <div className="chartContainer3">
          <SumpChart 
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              { 
                label: "duty", 
                color: "green", 
                data: sumpRecords.map(r => r.payload?.duty) 
              } 
            ]}
            options={controlBarChartOptions}  
          />
        </div>
        <div className="chartContainer4">
          <SumpChart 
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              { 
                label: "period", 
                color: "red", 
                data: sumpRecords.map(r => r.payload?.duty) 
              } 
            ]}
            options={controlBarChartOptions}   
          />
        </div>

      <div className="lastRun">Last Run: {columnStats?.lastDatetime ?? "N/a"}</div>
      <button className="sidebarButton" onClick={toggleSidebar}>
        {isSidebarOpen ? "Close Chart" : "View Graph"}
      </button>
    </header>
  );
};
export default ControlBar;
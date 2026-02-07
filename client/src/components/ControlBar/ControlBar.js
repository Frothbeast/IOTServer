// components/ControlBar/ControlBar.js
import SumpChart from '../sumpChart';
import './ControlBar.css';

const ControlBar = ({ selectedHours, onHoursChange, columnStats, sumpRecords, toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="controlBar">
      <div className="brand">Sump</div>
      <select className="selectedHours" value={selectedHours} onChange={(e) => onHoursChange(Number(e.target.value))}>
        <option value={1}>Last Hour</option>
        <option value={24}>Last 24 Hours</option>
      </select>

        
      <div className="chartContainer1">
        <SumpChart label="Hadc" color="red" data={sumpRecords.map(r => r.payload?.Hadc)} />
      </div>
      <div className="chartContainer2">
        <SumpChart label="Ladc" color="blue" data={sumpRecords.map(r => r.payload?.Ladc)} />
      </div>
        <div className="chartContainer3">
        <SumpChart label="Ladc" color="yellow" data={sumpRecords.map(r => r.payload?.duty)} />
      </div>
        <div className="chartContainer4">
        <SumpChart label="Ladc" color="green" data={sumpRecords.map(r => r.payload?.timeOn)} />
      </div>

      <div className="lastRun">Last Run: {columnStats?.lastDatetime ?? "N/a"}</div>
      <button className="sidebarButton" onClick={toggleSidebar}>
        {isSidebarOpen ? "Close Chart" : "View Graph"}
      </button>
    </header>
  );
};
export default ControlBar;
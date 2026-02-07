import './ControlBar.css';

const ControlBar = ({ selectedHours, onHoursChange, columnStats, toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="controlBar">
      <div className="brand">Sump</div>
      <select className="selectedHours" value={selectedHours} onChange={(e) => onHoursChange(Number(e.target.value))}>
        <option value={1}>Hour</option>
        <option value={24}>Day</option>
        <option value={168}>Week</option>
      </select>
        
      {/* Moved charts out of ControlBar to Sidebar for modularity */}
      {/* <div className="chartContainer1">
        <SumpChart ... />
      </div>
      ... 
      */}

      <div className="lastRun">Last Run: {columnStats?.lastDatetime ?? "N/a"}</div>
      <button className="sidebarButton" onClick={toggleSidebar}>
        {isSidebarOpen ? "Close Chart" : "View Graph"}
      </button>
    </header>
  );
};
export default ControlBar;
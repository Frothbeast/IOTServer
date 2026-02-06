// Destructure the props you need from the parent
import './ControlBar.css';
const ControlBar = ({ selectedHours, onHoursChange, stats, toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="controlBar" >
        <div className="brand">SumpMonitor v1</div>
        
        <select value={selectedHours} onChange={(e) => onHoursChange(Number(e.target.value))}>
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
        </select>

        {/* Displaying those "fun indicators" in the bar */}
        <div className="mini-stats">
            Avg Depth: {stats?.depth.avg}cm
        </div>

        <button onClick={toggleSidebar}>
            {isSidebarOpen ? "Close Chart" : "View Graph"}
        </button>
    </header>
  );
};

export default ControlBar;

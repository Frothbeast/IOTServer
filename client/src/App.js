import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSumpData } from './hooks/useSumpData';
import SumpTable from './components/sumpTable/sumpTable';
import './App.css';
import ControlBar from './components/ControlBar';

// Math library stays outside for clean access
const StatsLib = {
  avg: (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0,
  max: (arr) => arr.length ? Math.max(...arr) : 0,
  min: (arr) => arr.length ? Math.min(...arr) : 0,
};

function App() {
    const [selectedHours, setSelectedHours] = useState(24);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { sumpRecords, isLoading } = useSumpData(selectedHours);
    const controlBarRef = useRef(null);

    useEffect(() => {
        if (controlBarRef.current) {
            const height = controlBarRef.current.offsetHeight;
            // Set a global CSS variable everyone can access
            document.documentElement.style.setProperty('--control-bar-height', `${height}px`);
        }
    }); // This runs every time the component updates

    // Calculate Column Stats (e.g., for Depth and Temp)
    const columnStats = useMemo(() => {
        if (!sumpRecords?.length) return null;

        const depths = sumpRecords.map(r => parseFloat(r.payload?.depth)).filter(v => !isNaN(v));
        const temps = sumpRecords.map(r => parseFloat(r.payload?.temp)).filter(v => !isNaN(v));

        return {
            depth: { avg: StatsLib.avg(depths), max: StatsLib.max(depths), min: StatsLib.min(depths) },
            temp: { avg: StatsLib.avg(temps), max: StatsLib.max(temps), min: StatsLib.min(temps) }
        };
    }, [sumpRecords]);

    if (isLoading) return <div className="loader">Loading Sump Data...</div>;

return (
  <div className="App">
    <ControlBar
      selectedHours={selectedHours} 
      onHoursChange={setSelectedHours} // Pass the setter function
      stats={columnStats}              // Pass the calculated stats
      toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      isSidebarOpen={isSidebarOpen}
    />

    <main>
      <div className="tableWrapper">
      	<SumpTable sumpRecords={sumpRecords} />
      </div>
    </main>

            {/* --- SLIDE-OUT SIDEBAR --- */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <h3>Live Trend</h3>
                <div className="chartPlaceholder">
                    {/* You can drop a <LineChart data={sumpRecords} /> here later */}
                    <p>Graph for {selectedHours}h showing {sumpRecords.length} points.</p>
                </div>
            </aside>
        </div>
    );
}

export default App;

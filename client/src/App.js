import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSumpData } from './hooks/useSumpData';
import SumpTable from './components/sumpTable/sumpTable';
import './App.css';
import ControlBar from './components/ControlBar/ControlBar';

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

        const Hadcs = sumpRecords.map(r => parseFloat(r.payload?.Hadc)).filter(v => !isNaN(v));
        const Ladcs = sumpRecords.map(r => parseFloat(r.payload?.Ladc)).filter(v => !isNaN(v));
        const timeOns = sumpRecords.map(r => parseFloat(r.payload?.timeOn)).filter(v => !isNaN(v));
        const timeOffs = sumpRecords.map(r => parseFloat(r.payload?.timeOff)).filter(v => !isNaN(v));
        const hoursOns = sumpRecords.map(r => parseFloat(r.payload?.hoursOn)).filter(v => !isNaN(v));
        const duties = sumpRecords.map(r => parseFloat(r.payload?.duty)).filter(v => !isNaN(v));
        const datetime = sumpRecords.map(r => r.payload?.datetime);
        const lastDatetime = datetime[datetime.length - 1];
        return {
            Hadc: { avg: StatsLib.avg(Hadcs), max: StatsLib.max(Hadcs), min: StatsLib.min(Hadcs) },
            Ladc: { avg: StatsLib.avg(Ladcs), max: StatsLib.max(Ladcs), min: StatsLib.min(Ladcs) },
            timeOn: { avg: StatsLib.avg(timeOns), max: StatsLib.max(timeOns), min: StatsLib.min(timeOns) },
            timeOff: { avg: StatsLib.avg(timeOffs), max: StatsLib.max(timeOffs), min: StatsLib.min(timeOffs) },
            hoursOn: { avg: StatsLib.avg(hoursOns), max: StatsLib.max(hoursOns), min: StatsLib.min(hoursOns) },
            duty: { avg: StatsLib.avg(duties), max: StatsLib.max(duties), min: StatsLib.min(duties) },
            datetime: { avg: StatsLib.avg(datetime.slice(1).map((v, i) => v - datetime[i])),
                        max: StatsLib.max(datetime.slice(1).map((v, i) => v - datetime[i])),
                        min: StatsLib.min(datetime.slice(1).map((v, i) => v - datetime[i]))
                        },
            lastDatetime: lastDatetime
        };
    }, [sumpRecords]);

    if (isLoading) return <div className="loader">Loading Sump Data...</div>;

return (
  <div className="App">
    <ControlBar
      selectedHours={selectedHours} 
      onHoursChange={setSelectedHours} // Pass the setter function
      columnStats={columnStats}              // Pass the calculated stats
      toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      isSidebarOpen={isSidebarOpen}
    />

    <main>
      <div className="tableWrapper">
      	<SumpTable sumpRecords={sumpRecords} columnStats={columnStats}/>
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

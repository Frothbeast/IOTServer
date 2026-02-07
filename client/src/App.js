// App.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSumpData } from './hooks/useSumpData';
import SumpTable from './components/sumpTable/sumpTable';
import ControlBar from './components/ControlBar/ControlBar';
import { calculateColumnStats } from './utils/sumpStats'; // Import logic
import './App.css';

function App() {
  const [selectedHours, setSelectedHours] = useState(24);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { sumpRecords, isLoading } = useSumpData(selectedHours);

  // App only handles the "orchestration" of data
  const columnStats = useMemo(() => calculateColumnStats(sumpRecords), [sumpRecords]);

  if (isLoading) return <div className="loader">Loading...</div>;

  return (
    <div className="App">
      <ControlBar
        selectedHours={selectedHours}
        onHoursChange={setSelectedHours}
        columnStats={columnStats}
        sumpRecords={sumpRecords} // Pass raw data for charts
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main>
        <div className="tableWrapper">
          <SumpTable sumpRecords={sumpRecords} columnStats={columnStats} />
          <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div class="chartContainer1">Chart 1</div>
            <div class="chartContainer2">Chart 2</div>
            <div class="chartContainer3">Chart 3</div>
            <div class="chartContainer4">Chart 4</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
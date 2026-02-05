// import React from 'react';
import React, { useState } from 'react';
import { useSumpData } from './hooks/useSumpData';
import SumpTable from './components/sumpTable/sumpTable';
import './App.css';


function App() {
//     const { sumpRecords, isLoading } = useSumpData(hours);
    const [selectedHours, setSelectedHours] = useState(24);
    const { sumpRecords, isLoading } = useSumpData(selectedHours);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="App">
            <select
                value={selectedHours}
//                 onChange={(e) => setSelectedHours(Number(e.target.value))}>
                onChange={(e) => setSelectedHours(Number(e.target.value))}>
                <option value={1}>Last Hour</option>
                <option value={24}>Last 24 Hours</option>
                <option value={168}>Last Week</option>
            </select>
{/* <SumpTable sumpRecords={sumpRecords} /> */}
            <SumpTable sumpRecords={sumpRecords} />
        </div>
    );
}

export default App;

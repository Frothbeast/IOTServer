// [2026-01-27] Always include all the code I write in the first place, and comment out my code that you change and insert your new correction.
import "./App.css";
import { useState, useEffect } from 'react';

function App() {
    const [counter, setCounter] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [clickCounter, setClickCounter] = useState(0);
    
    // Database State
    const [sumpRecords, setSumpRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const startTime = Date.now();

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
            setTotalTime(Math.round((Date.now() - startTime) / 1000));

            fetch('http://localhost:5000/api/data')
                .then(res => res.json())
                .then(data => {
                    setSumpRecords(data);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }, 1000);


        return () => clearInterval(interval);
    }, [startTime]);

    // Placeholder Logic: Creates 10 rows of 'n/a'
    const renderTableRows = () => {
        const rows = isLoading || sumpRecords.length === 0 
            ? Array.from({ length: 10 }).map((_, i) => ({ payload: { timeON: 'n/a', timeOff: 'n/a', hoursOn: 'n/a' } }))
            : sumpRecords;

        return rows.map((row, index) => (
            <tr key={index}>
                {/* <td>{row.timeON}</td>
                <td>{row.timeOff}</td>
                <td>{row.hoursOn}</td> */}
                <td>{row.payload?.timeON || 'n/a'}</td>
                <td>{row.payload?.timeOff || 'n/a'}</td>
                <td>{row.payload?.hoursOn || 'n/a'}</td>
            </tr>
        ));
    };

    return (
        <div className="App">
            <h1>FrothServer</h1>
            
            {/* Navigation Links to Games */}
            <nav style={{ marginBottom: '20px' }}>
                <a href="/pages/pvp.html" style={{ color: '#00d1b2', marginRight: '20px' }}>Play PVP</a>
                <a href="/pages/starfield.html" style={{ color: '#00d1b2' }}>Play Starfield</a>
            </nav>

            <h1>Server webpage time since restart {totalTime}s</h1>
            <h2>Session Time Since last reset {counter}s</h2>
            <h2>Number of clicks of reset {clickCounter}</h2>
            
            <button onClick={() => { setCounter(0); setClickCounter(prev => prev + 1); }}>reset timer</button>

            <div className="table-container" style={{ marginTop: '30px' }}>
                <h3>Last 20 Sump Pump Records</h3>
                <table className="sump-table">
                    <thead>
                        <tr>
                            <th>Time On</th>
                            <th>Time Off</th>
                            <th>Hours On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
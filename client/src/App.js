// [2026-01-29] Always include all the code I write in the first place, and comment out my code that you change and insert your new correction.
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

            // fetch('http://localhost:5000/api/data')
            // Correction: Use relative path so it works on any network IP
            fetch('/api/data')
                .then(res => res.json())
                .then(data => {
                    setSumpRecords(data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Fetch error:", err);
                    setIsLoading(false);
                });
        }, 1000);


        return () => clearInterval(interval);
    }, [startTime]);

    const renderDynamicTable = () => {
        if (isLoading) return <p>Loading data...</p>;
        if (!sumpRecords || sumpRecords.length === 0) return <p>No data available in database.</p>;

        const records = sumpRecords.map(row => 
            typeof row.payload === 'object' && row.payload !== null ? row.payload : {}
        );

        const allKeys = [...new Set(records.flatMap(obj => Object.keys(obj)))];

        return (
            <table className="sump-table">
                <thead>
                    <tr>
                        {allKeys.map(key => <th key={key}>{key}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr key={index}>
                            {allKeys.map(key => (
                                <td key={key}>
                                    {record[key] !== undefined ? String(record[key]) : 'n/a'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="App">
            <h1>FrothServer</h1>
            
            <nav style={{ marginBottom: '20px' }}>
                <a href="/pages/pvp.html" style={{ color: '#00d1b2', marginRight: '20px' }}>Play PVP</a>
                <a href="/pages/starfield.html" style={{ color: '#00d1b2' }}>Play Starfield</a>
            </nav>

            <h1>Server webpage time since restart {totalTime}s</h1>
            <h2>Session Time Since last reset {counter}s</h2>
            <h2>Number of clicks of reset {clickCounter}</h2>
            
            <button onClick={() => { setCounter(0); setClickCounter(prev => prev + 1); }}>reset timer</button>

            <div className="table-container" style={{ marginTop: '30px' }}>
                <h3>Dynamic JSON Data Table</h3>
                {renderDynamicTable()}
            </div>
        </div>
    );
}

export default App;

import "./assets/css/App.css";
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
        }, 1000);

        // Fetching the last 10 records
        fetch('/api/sump-data?limit=10')
            .then(res => res.json())
            .then(data => {
                setSumpRecords(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));

        return () => clearInterval(interval);
    }, []);

    // Placeholder Logic: Creates 10 rows of 'n/a'
    const renderTableRows = () => {
        const rows = isLoading || sumpRecords.length === 0 
            ? Array.from({ length: 10 }).map((_, i) => ({ timeON: 'n/a', timeOff: 'n/a', hoursOn: 'n/a' }))
            : sumpRecords;

        return rows.map((row, index) => (
            <tr key={index}>
                <td>{row.timeON}</td>
                <td>{row.timeOff}</td>
                <td>{row.hoursOn}</td>
            </tr>
        ));
    };

    return (
        <div className="App">
            <h1>FrothServer</h1>
            <h1>Server webpage time since restart {totalTime}s</h1>
            <h2>Session Time Since last reset {counter}s</h2>
            <h2>Number of clicks of reset {clickCounter}</h2>
            
            <button onClick={() => { setCounter(0); setClickCounter(prev => prev + 1); }}>reset timer</button>

            <div className="table-container" style={{ marginTop: '30px' }}>
                <h3>Last 10 Sump Pump Records</h3>
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
import useSumpData from './components/sumpTable/sumpTable';
import './App.css';

const APP_START_TIME = Date.now();

function App() {
    const { counter, totalTime, clickCounter, sumpRecords, isLoading, resetTimer } = useSumpData(APP_START_TIME);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="App">
            <h1>Sump Pump Monitor</h1>
            <p>Counter: {counter}</p>
            <p>Total Time: {totalTime}</p>
            <p>Click Count: {clickCounter}</p>
            <button onClick={resetTimer}>Reset</button>

            {/* <ul>
                {sumpRecords.map((record, index) => (
                    <li key={index}>{JSON.stringify(record)}</li>
                ))}
            </ul> 
            */}

            {/* Correction: Structured table using BEM classes from sumpTable.css */}
            <table className="sump-table">
                <thead className="sump-table__head">
                    <tr className="sump-table__row">
                        <th className="sump-table__header-cell">ID</th>
                        <th className="sump-table__header-cell">Time On</th>
                        <th className="sump-table__header-cell">Time Off</th>
                        <th className="sump-table__header-cell">Duration (Hrs)</th>
                    </tr>
                </thead>
                <tbody>
                    {sumpRecords.map((row) => (
                        <tr key={row.id} className="sump-table__row">
                            <td className="sump-table__cell">{row.id}</td>
                            <td className="sump-table__cell">{row.payload.timeON || 'N/A'}</td>
                            <td className="sump-table__cell">{row.payload.timeOff || 'N/A'}</td>
                            <td className="sump-table__cell">{row.payload.hoursOn || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;

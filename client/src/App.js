import useSumpData from './components/sumpTable/sumpTable';

function App() {
    const { counter, totalTime, clickCounter, sumpRecords, isLoading, resetTimer } = useSumpData();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Sump Pump Monitor</h1>
            <p>Counter: {counter}</p>
            <p>Total Time: {totalTime}</p>
            <p>Click Count: {clickCounter}</p>
            <button onClick={resetTimer}>Reset</button>
            <ul>
                {sumpRecords.map((record, index) => (
                    <li key={index}>{JSON.stringify(record)}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;

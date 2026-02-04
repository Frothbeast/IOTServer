import React from 'react';
import { useServerData } from './hooks/useServerData';
import SumpTable from './components/sumpTable/sumpTable';
import './App.css';

const APP_START_TIME = Date.now();

function App() {
    const { counter, totalTime, clickCounter, sumpRecords, isLoading, resetTimer } = useServerData(APP_START_TIME);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="App">
            <h1>Sump Pump Monitor</h1>
            <p>Counter: {counter}</p>
            <SumpTable sumpRecords={sumpRecords} />
        </div>
    );
}

export default App;

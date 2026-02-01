import { useState, useEffect } from 'react';
import './sumpTable.css';

export default function useSumpData(startTime) {
    const [counter, setCounter] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [clickCounter, setClickCounter] = useState(0);
    const [sumpRecords, setSumpRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/api/data') // Correction: Match the route in sumpPumpWifiAPI.py
                .then(res => res.json())
                .then(data => {
                    /*
                    // This check prevents the "Cannot destructure" error
                    if (data && data.records) {
                        setSumpRecords(data.records);
                    }
                    */

                    // Correction: Python backend returns an array directly
                    if (Array.isArray(data)) {
                        setSumpRecords(data);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });

            setCounter((prev) => prev + 1);
            if (startTime) {
                setTotalTime(Math.round((Date.now() - startTime) / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const resetTimer = () => {
        setCounter(0);
        setClickCounter(prev => prev + 1);
    };

    return { counter, totalTime, clickCounter, sumpRecords, isLoading, resetTimer };
}

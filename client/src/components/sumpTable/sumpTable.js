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
            fetch('/api/sump-status')
                .then(res => res.json())
                .then(data => {
                    // This check prevents the "Cannot destructure" error
                    if (data && data.records) {
                        setSumpRecords(data.records);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const resetTimer = () => {
        setCounter(0);
        setClickCounter(prev => prev + 1);
    };

    return { counter, totalTime, clickCounter, sumpRecords, isLoading, resetTimer };
}

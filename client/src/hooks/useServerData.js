import { useState, useEffect } from 'react';

export function useServerData() {
    const [counter, setCounter] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [clickCounter, setClickCounter] = useState(0);
    const [sumpRecords, setSumpRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [startTime] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prev) => prev + 1);
            setTotalTime(Math.round((Date.now() - startTime) / 1000));

            fetch('/api/data')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSumpRecords(data);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Fetch error:", err);
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

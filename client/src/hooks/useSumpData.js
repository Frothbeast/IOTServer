import { useState, useEffect } from 'react';

export function useSumpData(hours) {
    const [sumpRecords, setSumpRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`/api/sumpData?hours=${hours}`)
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
    }, [hours]);

    return { sumpRecords, isLoading };
}

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SumpChart = ({ datasets, labels }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: true } 
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [datasets, labels]);

  return <canvas ref={chartRef} />;
};

export default SumpChart;
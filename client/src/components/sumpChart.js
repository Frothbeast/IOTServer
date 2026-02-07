import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SumpChart = ({ data, label, color }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          label: label,
          data: data,
          borderColor: color,
          tension: 0.1,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [data, label, color]);

  return <canvas ref={chartRef} />;
};

export default SumpChart;
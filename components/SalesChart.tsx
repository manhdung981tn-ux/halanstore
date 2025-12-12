import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export const SalesChart: React.FC = () => {
  const data = {
    labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [2500000, 3800000, 4200000, 8900000, 7500000, 11000000, 15000000],
        borderColor: '#2563EB', // brand-blue
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
          return gradient;
        },
        tension: 0.4, // Spline curve
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563EB',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        displayColors: false,
        callbacks: {
          label: (context: any) => `${new Intl.NumberFormat('vi-VN').format(context.raw)}đ`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#94A3B8',
          font: { family: 'Inter', size: 11 }
        },
        border: { display: false }
      },
      y: {
        display: false, // Hide Y axis for cleaner look
        border: { display: false }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="h-full w-full">
      <Line data={data} options={options as any} />
    </div>
  );
};
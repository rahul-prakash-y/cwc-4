import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DailyProgressionChart: React.FC = () => {
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Cyber Circus Kings 🎪',
        data: [150, 400, 700, 900, 1400, 1600, 1850, 2100, 2400, 2800],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#0B0A16',
        pointHoverRadius: 7,
      },
      {
        label: 'Neon Ringmasters 🦁',
        data: [120, 370, 620, 850, 1250, 1500, 1720, 1950, 2200, 2550],
        borderColor: '#FF0055',
        backgroundColor: 'rgba(255, 0, 85, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF0055',
        pointBorderColor: '#0B0A16',
        pointHoverRadius: 7,
      },
      {
        label: 'Jesters of Java 🃏',
        data: [100, 300, 500, 700, 1100, 1350, 1610, 1800, 2050, 2350],
        borderColor: '#00F0FF',
        backgroundColor: 'rgba(0, 240, 255, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00F0FF',
        pointBorderColor: '#0B0A16',
        pointHoverRadius: 7,
      },
      {
        label: 'High Wire Hackers 🚀',
        data: [90, 250, 450, 650, 980, 1200, 1480, 1650, 1890, 2100],
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8A2BE2',
        pointBorderColor: '#0B0A16',
        pointHoverRadius: 7,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E2E8F0',
          font: {
            family: 'monospace',
            weight: 'bold',
            size: 11,
          },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 18, 40, 0.95)',
        titleColor: '#FFD700',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255, 215, 0, 0.4)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'monospace',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'monospace',
            size: 11,
          },
          callback: (value) => `${value} pts`,
        },
      },
    },
  };

  return (
    <div className="w-full h-[360px] sm:h-[420px] p-2">
      <Line data={data} options={options} />
    </div>
  );
};

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

interface DailyProgressionChartProps {
  chartData?: {
    labels: string[];
    datasets: any[];
  };
}

export const DailyProgressionChart: React.FC<DailyProgressionChartProps> = ({ chartData }) => {
  const defaultDays = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

  const data = {
    labels: chartData?.labels && chartData.labels.length > 0 ? chartData.labels : defaultDays,
    datasets: chartData?.datasets && chartData.datasets.length > 0 ? chartData.datasets : [],
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

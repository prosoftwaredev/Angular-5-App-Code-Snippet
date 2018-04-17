/**
 * Chart.js config values.
 */
import { Palette } from './palette.config';

const ChartColors = [
  {
    backgroundColor: 'rgba(0, 0, 0, 0)', // transparent
    borderColor: Palette.secondary,
    pointBackgroundColor: Palette.primary,
    pointBorderColor: '#ffffff',
    pointHoverBackgroundColor: Palette.base,
    pointHoverBorderColor: 'rgba(0, 0, 0, 0)', // transparent
    pointRadius: 6,
    pointHoverRadius: 7
  }
];

const ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  spanGaps: true,
  tooltips: {
    enabled: true,
    xPadding: 10,
    yPadding: 10,
    displayColors: false,
    backgroundColor: '#f5f5f5',
    titleFontColor: '#484848',
    bodyFontColor: '#484848',
    borderColor: '#484848',
    borderWidth: 1
  },
  legend: {
    display: false
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          callback: function(value, index, values) {
            return value.toFixed(1);
          }
        }
      }
    ]
  }
};

function ChartConfigFactory(type: string) {
  switch (type) {
    case 'bar':
      return {
        options: ChartOptions
      };
    case 'line':
    default:
      return {
        colors: ChartColors,
        options: ChartOptions
      };
  }
}

export const ChartConfig = {
  factory: ChartConfigFactory
};

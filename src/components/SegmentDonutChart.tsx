import React from 'react';
import { formatCompactCurrency } from '../data/superstoreData';

export type SegmentKey = 'Consumer' | 'Corporate' | 'Home Office';

interface SegmentDonutChartProps {
  consumerSales: number;
  corporateSales: number;
  homeOfficeSales: number;
  selectedSegment: SegmentKey | null;
  onSelectSegment: (seg: SegmentKey | null) => void;
}

export const SegmentDonutChart: React.FC<SegmentDonutChartProps> = ({
  consumerSales,
  corporateSales,
  homeOfficeSales,
  selectedSegment,
  onSelectSegment,
}) => {
  const total = Math.max(1, consumerSales + corporateSales + homeOfficeSales);

  // Exact colors matching the reference donut chart:
  // Consumer (bright red #ff0909), Corporate (medium pink-red #ec4c6a), Home Office (soft pink #f28aa0)
  const segments: Array<{
    key: SegmentKey;
    value: number;
    color: string;
  }> = [
    {
      key: 'Consumer',
      value: consumerSales,
      color: '#ff0909',
    },
    {
      key: 'Corporate',
      value: corporateSales,
      color: '#ec4c6a',
    },
    {
      key: 'Home Office',
      value: homeOfficeSales,
      color: '#f28aa0',
    },
  ];

  const radius = 44;
  const strokeWidth = 19;
  const circumference = 2 * Math.PI * radius;

  let accumulatedFraction = 0;

  return (
    <div
      className="relative w-full h-[180px] flex items-center justify-center select-none"
      dir="ltr"
    >
      {/* Top-Left Callout matching reference: Home Office 2.3M */}
      <button
        type="button"
        onClick={() =>
          onSelectSegment(selectedSegment === 'Home Office' ? null : 'Home Office')
        }
        className={`absolute top-1 left-1 text-center transition-opacity cursor-pointer z-10 ${
          selectedSegment && selectedSegment !== 'Home Office' ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <div className="text-[11.5px] font-semibold text-white leading-tight">
          المكاتب المنزلية
        </div>
        <div className="text-xs sm:text-[13px] font-bold font-mono-num kpi-num-white mt-0.5">
          {formatCompactCurrency(homeOfficeSales)}
        </div>
      </button>

      {/* Bottom-Left Callout matching reference: Corporate 3.8M */}
      <button
        type="button"
        onClick={() =>
          onSelectSegment(selectedSegment === 'Corporate' ? null : 'Corporate')
        }
        className={`absolute bottom-1.5 left-1 text-center transition-opacity cursor-pointer z-10 ${
          selectedSegment && selectedSegment !== 'Corporate' ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <div className="text-[11.5px] font-semibold text-white leading-tight">
          الشركات
        </div>
        <div className="text-xs sm:text-[13px] font-bold font-mono-num kpi-num-white mt-0.5">
          {formatCompactCurrency(corporateSales)}
        </div>
      </button>

      {/* Bottom-Right Callout matching reference: Consumer 6.48M */}
      <button
        type="button"
        onClick={() =>
          onSelectSegment(selectedSegment === 'Consumer' ? null : 'Consumer')
        }
        className={`absolute bottom-1.5 right-1 text-center transition-opacity cursor-pointer z-10 ${
          selectedSegment && selectedSegment !== 'Consumer' ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <div className="text-[11.5px] font-semibold text-white leading-tight">
          المستهلكين
        </div>
        <div className="text-xs sm:text-[13px] font-bold font-mono-num kpi-num-white mt-0.5">
          {formatCompactCurrency(consumerSales)}
        </div>
      </button>

      {/* Pure Hollow SVG Donut Ring matching reference image (no text inside the hole) */}
      <svg viewBox="0 0 130 130" className="w-[128px] h-[128px] -rotate-90">
        {segments.map((seg) => {
          const fraction = seg.value / total;
          const dashArray = `${fraction * circumference} ${circumference}`;
          const dashOffset = -accumulatedFraction * circumference;
          accumulatedFraction += fraction;
          const isSelected = selectedSegment === seg.key;

          return (
            <circle
              key={seg.key}
              cx={65}
              cy={65}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={isSelected ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-200 cursor-pointer hover:brightness-110"
              strokeOpacity={
                selectedSegment && selectedSegment !== seg.key ? 0.35 : 1
              }
              onClick={() =>
                onSelectSegment(selectedSegment === seg.key ? null : seg.key)
              }
            />
          );
        })}
      </svg>
    </div>
  );
};

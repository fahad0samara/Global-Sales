import React, { useState } from 'react';
import {
  formatCompactCurrency,
  QUARTERLY_CATEGORY_SERIES,
  QuarterlyCategoryRecord,
} from '../data/superstoreData';

interface CategoryTrendChartProps {
  selectedYears: number[];
  scaleFactor: number;
}

export const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({
  selectedYears,
  scaleFactor,
}) => {
  const [activeCategories, setActiveCategories] = useState<{
    furniture: boolean;
    officeSupplies: boolean;
    technology: boolean;
  }>({
    furniture: true,
    officeSupplies: true,
    technology: true,
  });

  const [hoveredState, setHoveredState] = useState<{
    point: QuarterlyCategoryRecord;
    index: number;
  } | null>(null);

  const series = QUARTERLY_CATEGORY_SERIES.filter((item) =>
    selectedYears.length === 0 ? true : selectedYears.includes(item.year)
  );

  // Clean SVG coordinate system without preserveAspectRatio="none" so text and circles never stretch
  const width = 580;
  const height = 195;
  const padLeft = 32;
  const padRight = 32;
  const padTop = 26;
  const padBottom = 28;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = 0.60;
  const minVal = 0.06;

  const getX = (index: number) => {
    if (series.length <= 1) return padLeft + plotW / 2;
    return padLeft + (index / (series.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const scaled = Math.min(maxVal, val * scaleFactor);
    const ratio = (scaled - minVal) / (maxVal - minVal);
    return padTop + plotH - Math.max(0, Math.min(1, ratio)) * plotH;
  };

  const buildPolyline = (key: 'furniture' | 'officeSupplies' | 'technology') => {
    return series
      .map((pt, idx) => `${getX(idx).toFixed(1)},${getY(pt[key]).toFixed(1)}`)
      .join(' ');
  };

  const toggleCat = (key: 'furniture' | 'officeSupplies' | 'technology') => {
    setActiveCategories((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.furniture && !next.officeSupplies && !next.technology) {
        return prev;
      }
      return next;
    });
  };

  const isHoveredOnRightSide = hoveredState
    ? hoveredState.index >= series.length / 2
    : false;

  return (
    <div className="flex flex-col flex-1 w-full justify-between">
      {/* Legend Row matching exact reference dots: Furniture (#ff0909), Office Supplies (#ec4c6a), Technology (#f28aa0) */}
      <div className="flex flex-wrap items-center gap-3.5 text-xs mt-0.5">
        <button
          type="button"
          onClick={() => toggleCat('furniture')}
          className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
            activeCategories.furniture ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff0909] inline-block shrink-0" />
          <span className="font-semibold text-white">الأثاث</span>
        </button>

        <button
          type="button"
          onClick={() => toggleCat('officeSupplies')}
          className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
            activeCategories.officeSupplies ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ec4c6a] inline-block shrink-0" />
          <span className="font-semibold text-white">مستلزمات مكتبية</span>
        </button>

        <button
          type="button"
          onClick={() => toggleCat('technology')}
          className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
            activeCategories.technology ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#f28aa0] inline-block shrink-0" />
          <span className="font-semibold text-white">التكنولوجيا</span>
        </button>
      </div>

      {/* Multi-line SVG Chart with Proportional Aspect Ratio */}
      <div className="relative w-full flex-1 flex items-end overflow-hidden" dir="ltr">
        {/* Floating Tooltip Overlay positioned cleanly inside the chart area */}
        {hoveredState && (
          <div
            className={`pointer-events-none absolute top-0 ${
              isHoveredOnRightSide ? 'left-1' : 'right-1'
            } bg-black/95 border border-[#ff1111] px-2.5 py-1.5 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,0.9)] z-30 min-w-[195px] text-right`}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1 gap-2">
              <span className="text-[11px] font-bold text-white">
                {hoveredState.point.labelAr} ({hoveredState.point.quarter})
              </span>
              <span className="text-[10px] font-mono-num text-neutral-400" dir="ltr">
                {hoveredState.point.labelShortAr}
              </span>
            </div>

            <div className="space-y-0.5 text-[10.5px]">
              {activeCategories.technology && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-[#f28aa0] inline-block" />
                    <span>التكنولوجيا:</span>
                  </span>
                  <span className="font-mono-num font-bold text-white" dir="ltr">
                    {formatCompactCurrency(
                      hoveredState.point.technology * scaleFactor * 1_000_000
                    )}{' '}
                    ($
                    {Math.round(
                      hoveredState.point.technology * scaleFactor * 1_000_000
                    ).toLocaleString('en-US')}
                    )
                  </span>
                </div>
              )}

              {activeCategories.officeSupplies && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-[#ec4c6a] inline-block" />
                    <span>مكاتب:</span>
                  </span>
                  <span className="font-mono-num font-bold text-white" dir="ltr">
                    {formatCompactCurrency(
                      hoveredState.point.officeSupplies * scaleFactor * 1_000_000
                    )}{' '}
                    ($
                    {Math.round(
                      hoveredState.point.officeSupplies * scaleFactor * 1_000_000
                    ).toLocaleString('en-US')}
                    )
                  </span>
                </div>
              )}

              {activeCategories.furniture && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-[#ff0909] inline-block" />
                    <span>الأثاث:</span>
                  </span>
                  <span className="font-mono-num font-bold text-white" dir="ltr">
                    {formatCompactCurrency(
                      hoveredState.point.furniture * scaleFactor * 1_000_000
                    )}{' '}
                    ($
                    {Math.round(
                      hoveredState.point.furniture * scaleFactor * 1_000_000
                    ).toLocaleString('en-US')}
                    )
                  </span>
                </div>
              )}
            </div>

            <div className="mt-1 pt-1 border-t border-neutral-800 flex items-center justify-between text-[10.5px]">
              <span className="text-neutral-400 font-semibold">إجمالي الربع:</span>
              <span className="font-mono-num font-bold text-[#ff1111]" dir="ltr">
                {formatCompactCurrency(
                  ((activeCategories.technology ? hoveredState.point.technology : 0) +
                    (activeCategories.officeSupplies ? hoveredState.point.officeSupplies : 0) +
                    (activeCategories.furniture ? hoveredState.point.furniture : 0)) *
                    scaleFactor *
                    1_000_000
                )}
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[195px] select-none"
        >
          {/* Furniture Line (#ff0909) */}
          {activeCategories.furniture && (
            <polyline
              fill="none"
              stroke="#ff0909"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={buildPolyline('furniture')}
            />
          )}

          {/* Office Supplies Line (#ec4c6a) */}
          {activeCategories.officeSupplies && (
            <polyline
              fill="none"
              stroke="#ec4c6a"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={buildPolyline('officeSupplies')}
            />
          )}

          {/* Technology Line (#f28aa0) */}
          {activeCategories.technology && (
            <polyline
              fill="none"
              stroke="#f28aa0"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={buildPolyline('technology')}
            />
          )}

          {/* Interactive Data Points & Reference Callout Value Labels */}
          {series.map((pt, idx) => {
            const cx = getX(idx);
            const isHovered =
              hoveredState?.point.year === pt.year &&
              hoveredState?.point.quarter === pt.quarter;

            return (
              <g
                key={`${pt.year}-${pt.quarter}`}
                onMouseEnter={() => setHoveredState({ point: pt, index: idx })}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() =>
                  setHoveredState((prev) =>
                    prev?.index === idx ? null : { point: pt, index: idx }
                  )
                }
                className="cursor-pointer"
              >
                {/* Hover vertical indicator line & glowing data vertex circles */}
                {isHovered && (
                  <>
                    <line
                      x1={cx}
                      y1={padTop - 6}
                      x2={cx}
                      y2={height - padBottom}
                      stroke="#ff1111"
                      strokeDasharray="3 3"
                      strokeWidth="1.2"
                    />
                    {activeCategories.furniture && (
                      <circle
                        cx={cx}
                        cy={getY(pt.furniture)}
                        r="4"
                        fill="#ff0909"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                    {activeCategories.officeSupplies && (
                      <circle
                        cx={cx}
                        cy={getY(pt.officeSupplies)}
                        r="4"
                        fill="#ec4c6a"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                    {activeCategories.technology && (
                      <circle
                        cx={cx}
                        cy={getY(pt.technology)}
                        r="4"
                        fill="#f28aa0"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </>
                )}

                {/* Invisible hover column for smooth scrubbing */}
                <rect
                  x={cx - 16}
                  y={padTop - 8}
                  width={32}
                  height={plotH + 14}
                  fill="transparent"
                />

                {/* Annotated Milestone Labels matching the visual reference image */}
                {pt.highlightLabel?.map((hl, hIdx) => {
                  const rawVal = pt[hl.category] * scaleFactor;
                  const cy = getY(pt[hl.category]);
                  const labelY = hl.position === 'top' ? cy - 8 : cy + 15;
                  return (
                    <text
                      key={hIdx}
                      x={cx}
                      y={labelY}
                      textAnchor="middle"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                      fontSize="12"
                      fontWeight="700"
                      className="font-mono-num"
                    >
                      {rawVal.toFixed(2)}M
                    </text>
                  );
                })}

                {/* Single-line X-Axis Date Labels matching reference (يناير 2019, يوليو 2019...) */}
                {pt.showAxisLabel && (
                  <text
                    x={cx}
                    y={height - 6}
                    textAnchor="middle"
                    fill="#f5f5f5"
                    fontSize="10.5"
                    fontWeight="600"
                  >
                    {pt.labelAr}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CONTINENTS,
  formatCompactCurrency,
  ProductRecord,
  TOP_PRODUCTS_DATA,
} from '../data/superstoreData';

interface TopProductsBarChartProps {
  selectedYears: number[];
  continentScaleFactor: number;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
}

interface ComputedProduct extends ProductRecord {
  totalProfit: number;
  totalSales: number;
  profitMarginPercent: string;
  kText: string;
  topContinentAr: string;
  arabicLines: [string, string, string];
}

const ARABIC_BAR_LABELS: Record<string, [string, string, string]> = {
  'canon-2200': ['ناسخة كانون', '2200', 'المتقدمة'],
  'cisco-smart': ['هاتف سيسكو', 'الذكي،', 'حجم كامل'],
  'motorola-smart': ['هاتف موتورولا', 'الذكي،', 'حجم كامل'],
  'hoover-stove': ['موقد هوفر،', 'أحمر', 'احترافي'],
  'sauder-bookcase': ['خزانة كتب', 'كلاسيكية،', 'تقليدية'],
};

export const TopProductsBarChart: React.FC<TopProductsBarChartProps> = ({
  selectedYears,
  continentScaleFactor,
  selectedProductId,
  onSelectProduct,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const computedProducts: ComputedProduct[] = TOP_PRODUCTS_DATA.map((prod) => {
    const yearsToSum = selectedYears.length > 0 ? selectedYears : [2019, 2020, 2021, 2022];
    const baseProfit = yearsToSum.reduce((sum, y) => sum + (prod.profitByYear[y] || 0), 0);
    const baseSales = yearsToSum.reduce((sum, y) => sum + (prod.salesByYear[y] || 0), 0);
    const scaledProfit = Math.round(baseProfit * continentScaleFactor);
    const scaledSales = Math.round(baseSales * continentScaleFactor);
    const margin = scaledSales > 0 ? ((scaledProfit / scaledSales) * 100).toFixed(1) : '0.0';
    const topContinentAr =
      CONTINENTS.find((c) => c.id === prod.topContinent)?.nameAr || prod.topContinent;

    return {
      ...prod,
      totalProfit: scaledProfit,
      totalSales: scaledSales,
      profitMarginPercent: margin,
      kText: `${Math.max(1, Math.round(scaledProfit / 1000))}K`,
      topContinentAr,
      arabicLines: ARABIC_BAR_LABELS[prod.id] || [prod.nameAr, '', ''],
    };
  });

  const maxProfit = Math.max(...computedProducts.map((p) => p.totalProfit), 1);
  const activeProduct =
    hoveredIndex !== null
      ? computedProducts[hoveredIndex]
      : selectedProductId
        ? computedProducts.find((p) => p.id === selectedProductId) || null
        : null;

  return (
    <div className="relative flex flex-col flex-1 w-full justify-between pt-2">
      {/* Floating Tooltip Overlay positioned cleanly inside top of chart container */}
      {activeProduct && (
        <div
          className={`pointer-events-none absolute top-1 ${
            hoveredIndex !== null && hoveredIndex <= 1 ? 'left-1' : 'right-1'
          } bg-black/95 border border-[#ff1111] px-2.5 py-1.5 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,0.9)] z-30 min-w-[200px] max-w-[235px] text-right`}
          dir="rtl"
        >
          <div className="border-b border-neutral-800 pb-1 mb-1">
            <div className="text-[11px] font-bold text-white leading-snug">
              {activeProduct.nameAr.split(' (')[0]}
            </div>
            <div className="text-[9.5px] text-neutral-400 truncate" dir="ltr">
              {activeProduct.nameEn}
            </div>
          </div>

          <div className="space-y-0.5 text-[10.5px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-neutral-300">صافي الربح:</span>
              <span className="font-mono-num font-bold text-[#ff1111]" dir="ltr">
                {formatCompactCurrency(activeProduct.totalProfit)} ($
                {activeProduct.totalProfit.toLocaleString('en-US')})
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-neutral-300">المبيعات:</span>
              <span className="font-mono-num font-bold text-white" dir="ltr">
                {formatCompactCurrency(activeProduct.totalSales)} ($
                {activeProduct.totalSales.toLocaleString('en-US')})
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-neutral-300">هامش الربح:</span>
              <span className="font-mono-num font-semibold text-neutral-200" dir="ltr">
                {activeProduct.profitMarginPercent}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-neutral-800 text-[10px]">
              <span className="text-neutral-400">الفئة: {activeProduct.categoryAr}</span>
              <span className="text-neutral-400">الأعلى: {activeProduct.topContinentAr}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5 Vertical Red Bars matching exact reference layout */}
      <div
        className="grid grid-cols-5 gap-3 sm:gap-4 items-end pt-2 pb-1 px-2 flex-1"
        dir="ltr"
      >
        {computedProducts.map((prod, index) => {
          const heightPercent = Math.max(22, Math.round((prod.totalProfit / maxProfit) * 100));
          const isSelected = selectedProductId === prod.id;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => onSelectProduct(isSelected ? null : prod.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              className={`group flex flex-col items-center justify-end h-full cursor-pointer transition-opacity ${
                selectedProductId && !isSelected ? 'opacity-45' : 'opacity-100'
              }`}
            >
              {/* Value Label above bar (25K, 17K, 17K, 12K, 11K) */}
              <div
                className={`text-xs sm:text-[13px] font-bold font-mono-num mb-1.5 transition-colors ${
                  isHovered || isSelected ? 'kpi-num-crimson' : 'kpi-num-white'
                }`}
              >
                {prod.kText}
              </div>

              {/* Bar Track */}
              <div className="w-full h-[115px] flex items-end justify-center">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[46px] bg-[#ff0909] transition-all duration-200 group-hover:bg-[#ff2a2a] group-hover:shadow-[0_0_12px_rgba(255,17,17,0.65)] ${
                    isSelected || isHovered ? 'ring-1 ring-white' : ''
                  }`}
                />
              </div>

              {/* Clean Arabic 3-line Product Title Underneath */}
              <div className="mt-2 text-center leading-[1.25] min-h-[48px] flex flex-col justify-start w-full" dir="rtl">
                {prod.arabicLines.map((line, i) =>
                  line ? (
                    <span
                      key={i}
                      className="text-[10.5px] font-semibold text-neutral-200 block leading-tight"
                    >
                      {line}
                    </span>
                  ) : null
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

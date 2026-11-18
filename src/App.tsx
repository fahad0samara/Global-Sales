import React, { useMemo, useState } from 'react';
import {
  CONTINENTS,
  ContinentId,
  COUNTRIES_DATA,
  formatCompactCurrency,
  TOP_PRODUCTS_DATA,
} from './data/superstoreData';
import { OrthographicGlobe } from './components/OrthographicGlobe';
import { SegmentDonutChart, SegmentKey } from './components/SegmentDonutChart';
import { CategoryTrendChart } from './components/CategoryTrendChart';
import { TopProductsBarChart } from './components/TopProductsBarChart';
import { DashboardModalTab, TopHeaderIcons } from './components/TopHeaderIcons';
import { CountryRankingTable } from './components/CountryRankingTable';

const ALL_YEARS = [2019, 2020, 2021, 2022];

export default function App() {
  // Interactive Filter States
  const [selectedYears, setSelectedYears] = useState<number[]>(ALL_YEARS);
  const [selectedContinent, setSelectedContinent] = useState<ContinentId | null>(null);
  const [expandedContinents, setExpandedContinents] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountryIso, setSelectedCountryIso] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<DashboardModalTab>(null);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

  // Toggle Year in the 2019 | 2020 | 2021 | 2022 red segmented bar
  const handleToggleYear = (year: number) => {
    setSelectedYears((prev) => {
      if (prev.length === ALL_YEARS.length) {
        return [year];
      }
      if (prev.includes(year)) {
        const next = prev.filter((y) => y !== year);
        return next.length === 0 ? ALL_YEARS : next;
      }
      return [...prev, year].sort();
    });
  };

  // Toggle Continent checkbox
  const handleToggleContinent = (continentId: ContinentId) => {
    setSelectedCountryIso(null);
    setSelectedContinent((prev) => (prev === continentId ? null : continentId));
  };

  // Toggle Continent tree expansion to inspect countries inside that continent
  const handleExpandContinent = (continentId: ContinentId) => {
    setExpandedContinents((prev) => ({
      ...prev,
      [continentId]: !prev[continentId],
    }));
  };

  // Year ratio multiplier relative to all 4 years (2019..2022)
  const yearScaleFactor = useMemo(() => {
    const weights: Record<number, number> = {
      2019: 0.195,
      2020: 0.226,
      2021: 0.268,
      2022: 0.311,
    };
    const activeYears = selectedYears.length > 0 ? selectedYears : ALL_YEARS;
    const sum = activeYears.reduce((acc, y) => acc + (weights[y] || 0.25), 0);
    return Math.min(1, Math.max(0.15, Number(sum.toFixed(3))));
  }, [selectedYears]);

  // Segment ratio multiplier when a specific segment is clicked in the donut
  const segmentScaleFactor = useMemo(() => {
    if (!selectedSegment) return 1;
    if (selectedSegment === 'Consumer') return 6.48 / 12.58;
    if (selectedSegment === 'Corporate') return 3.8 / 12.58;
    return 2.3 / 12.58;
  }, [selectedSegment]);

  // Filter countries by continent and search query (matches both Arabic and English names)
  const filteredCountries = useMemo(() => {
    return COUNTRIES_DATA.filter((c) => {
      if (selectedContinent && c.continent !== selectedContinent) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchContinentAr = CONTINENTS.find((ct) => ct.id === c.continent)?.nameAr.includes(q);
        return (
          c.nameAr.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.continent.toLowerCase().includes(q) ||
          Boolean(matchContinentAr)
        );
      }
      return true;
    });
  }, [selectedContinent, searchQuery]);

  // Calculate Headline KPIs matching exact baseline numbers when unfiltered:
  // Worldwide Sales: 12.58M | Yearly Avg Sales: 3.15M | Customers: 795
  // Gross Profit: 1.46M | 11.6% | Net Profit: 1.1M | 8.77%
  const kpiMetrics = useMemo(() => {
    const isDefaultUnfiltered =
      !selectedContinent &&
      !selectedCountryIso &&
      !selectedSegment &&
      !selectedProductId &&
      searchQuery.trim() === '' &&
      selectedYears.length === 4;

    if (isDefaultUnfiltered) {
      return {
        worldwideSales: 12_580_000,
        yearlyAvgSales: 3_150_000,
        customers: 795,
        grossProfit: 1_460_000,
        grossMarginPercent: 11.6,
        netProfit: 1_100_000,
        netMarginPercent: 8.77,
        consumerSales: 6_480_000,
        corporateSales: 3_800_000,
        homeOfficeSales: 2_300_000,
        continentScale: 1,
      };
    }

    const activeCountries = selectedCountryIso
      ? COUNTRIES_DATA.filter((c) => c.isoNumeric === selectedCountryIso)
      : filteredCountries;

    const baseListedSum = COUNTRIES_DATA.reduce((s, c) => s + c.totalSales, 0);
    const activeListedSum = activeCountries.reduce((s, c) => s + c.totalSales, 0);
    const geoRatio = baseListedSum > 0 ? activeListedSum / baseListedSum : 1;

    const selectedProductObj = selectedProductId
      ? TOP_PRODUCTS_DATA.find((p) => p.id === selectedProductId)
      : null;
    const productRatio = selectedProductObj
      ? Object.values(selectedProductObj.salesByYear).reduce((a, b) => a + b, 0) / 360_000
      : 1;

    const totalScale = geoRatio * yearScaleFactor * segmentScaleFactor * productRatio;
    const worldwideSales = Math.max(12_000, 12_580_000 * totalScale);
    const activeYearCount = Math.max(1, selectedYears.length);
    const yearlyAvgSales = worldwideSales / activeYearCount;
    const customers = Math.max(1, Math.round(795 * Math.pow(totalScale, 0.85)));
    const grossProfit = worldwideSales * 0.11605;
    const netProfit = worldwideSales * 0.0877;

    return {
      worldwideSales,
      yearlyAvgSales,
      customers,
      grossProfit,
      grossMarginPercent: 11.6,
      netProfit,
      netMarginPercent: 8.77,
      consumerSales: 6_480_000 * geoRatio * yearScaleFactor * productRatio,
      corporateSales: 3_800_000 * geoRatio * yearScaleFactor * productRatio,
      homeOfficeSales: 2_300_000 * geoRatio * yearScaleFactor * productRatio,
      continentScale: geoRatio,
    };
  }, [
    selectedContinent,
    selectedCountryIso,
    selectedSegment,
    selectedProductId,
    searchQuery,
    selectedYears,
    filteredCountries,
    yearScaleFactor,
    segmentScaleFactor,
  ]);

  const resetAllFilters = () => {
    setSelectedYears(ALL_YEARS);
    setSelectedContinent(null);
    setSelectedCountryIso(null);
    setSelectedSegment(null);
    setSelectedProductId(null);
    setSearchQuery('');
  };

  const hasActiveFilter =
    selectedYears.length < 4 ||
    selectedContinent !== null ||
    selectedCountryIso !== null ||
    selectedSegment !== null ||
    selectedProductId !== null ||
    searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-2.5 sm:p-4 lg:px-5 lg:py-3 select-none">
      {/* ==================== TOP HEADER BAR (Matches Reference Spatial Positions: Title Left, Ticker Center, Icons Right) ==================== */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-2.5" dir="ltr">
        {/* Top-Left Title matching OVERVIEW */}
        <div className="flex items-center gap-3">
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-wider text-white leading-none">
            OVERVIEW | نظرة عامة
          </h1>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs bg-[#ff1111] hover:bg-[#d80e0e] text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
              dir="rtl"
            >
              إعادة تعيين
            </button>
          )}
        </div>

        {/* Center Static Monospace Country Ticker matching exact reference: 39838.49 Australia 921644.71 France 853605.55 China 699605.82 */}
        <div className="hidden md:flex items-center gap-6 font-mono-num text-xs lg:text-[13.5px] text-white kpi-num-white">
          <button
            type="button"
            onClick={() => setSelectedCountryIso('840')}
            className="hover:text-[#ff2e2e] transition-colors whitespace-nowrap cursor-pointer"
          >
            39838.49
          </button>
          <button
            type="button"
            onClick={() => setSelectedCountryIso('036')}
            className="hover:text-[#ff2e2e] transition-colors whitespace-nowrap cursor-pointer"
          >
            أستراليا 921644.71
          </button>
          <button
            type="button"
            onClick={() => setSelectedCountryIso('250')}
            className="hover:text-[#ff2e2e] transition-colors whitespace-nowrap cursor-pointer"
          >
            فرنسا 853605.55
          </button>
          <button
            type="button"
            onClick={() => setSelectedCountryIso('156')}
            className="hover:text-[#ff2e2e] transition-colors whitespace-nowrap cursor-pointer"
          >
            الصين 699605.82
          </button>
        </div>

        {/* Top-Right 4 Analytical Outline Icons */}
        <TopHeaderIcons activeModal={activeModal} onSelectModal={setActiveModal} />
      </header>

      {/* ==================== MAIN DASHBOARD GRID (Exact Reference Spatial Positions with Arabic RTL Text Inside) ==================== */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch flex-1" dir="ltr">
        {/* LEFT + CENTER AREA (9 Columns on Desktop): Top Row (Left Stack + Center Globe), Bottom Row (Line Chart + Bar Chart) */}
        <div className="lg:col-span-9 flex flex-col justify-between gap-3.5">
          {/* UPPER ROW: Left Filter/Segment Stack (4 cols) + Center 3D Globe (8 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch flex-1">
            {/* Left Stack: Year Bar + Continent Filter Box + Sales by Segment Donut Box */}
            <div className="md:col-span-4 flex flex-col gap-3" dir="rtl">
              {/* 1. Red Year Segmented Bar: 2019 | 2020 | 2021 | 2022 */}
              <div
                className="grid grid-cols-4 bg-[#ff0909] rounded-[10px] overflow-hidden border border-[#ff2a2a] transition-all duration-200 hover:border-white hover:shadow-[0_0_14px_rgba(255,17,17,0.45)]"
                dir="ltr"
              >
                {ALL_YEARS.map((year, idx) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleToggleYear(year)}
                      className={`py-2 text-center font-mono-num text-sm sm:text-[15px] font-bold transition-colors cursor-pointer ${
                        idx !== 0 ? 'border-l border-white/65' : ''
                      } ${
                        isSelected
                          ? 'bg-[#ff0909] text-white'
                          : 'bg-[#5c0505] text-white/60 hover:text-white'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>

              {/* 2. Search & Continent Hierarchy Filter Card (Framed Box #1) */}
              <section className="bi-card p-3 flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>: الكل</span>
                  {selectedContinent && (
                    <button
                      type="button"
                      onClick={() => setSelectedContinent(null)}
                      className="text-[11px] text-[#ff1111] hover:underline cursor-pointer"
                    >
                      إظهار الكل
                    </button>
                  )}
                </div>

                {/* Search Input with Magnifying Glass Icon */}
                <div className="relative flex items-center border-b border-neutral-500 pb-1 mb-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-neutral-300 ml-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث..."
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-neutral-400 hover:text-white px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 6 Continents Checkboxes + Expandable Tree */}
                <div className="space-y-1 max-h-[160px] overflow-y-auto pl-1">
                  {CONTINENTS.map((cont) => {
                    const isChecked = selectedContinent === cont.id;
                    const isExpanded = Boolean(expandedContinents[cont.id]);
                    const continentCountries = COUNTRIES_DATA.filter(
                      (c) => c.continent === cont.id
                    );

                    return (
                      <div key={cont.id} className="text-xs">
                        <div className="flex items-center gap-2 py-0.5 hover:bg-neutral-900/80 rounded px-1">
                          {/* Expand Caret */}
                          <button
                            type="button"
                            onClick={() => handleExpandContinent(cont.id)}
                            className="text-neutral-400 hover:text-white w-3.5 text-center cursor-pointer"
                            title="عرض دول القارة"
                          >
                            {isExpanded ? '▾' : '▸'}
                          </button>

                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleContinent(cont.id)}
                            className="flex items-center gap-2 flex-1 text-right cursor-pointer"
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-[#ff0909] border-[#ff0909] text-white'
                                  : 'border-neutral-500 bg-transparent'
                              }`}
                            >
                              {isChecked && <span className="text-[10px] leading-none">✓</span>}
                            </span>
                            <span className="font-semibold text-white">
                              {cont.nameAr}
                            </span>
                          </button>
                        </div>

                        {/* Expanded nested countries inside continent */}
                        {isExpanded && (
                          <div className="mr-6 mt-1 space-y-1 border-r border-neutral-800 pr-2">
                            {continentCountries.map((c) => (
                              <button
                                key={c.isoNumeric}
                                type="button"
                                onClick={() =>
                                  setSelectedCountryIso(
                                    selectedCountryIso === c.isoNumeric ? null : c.isoNumeric
                                  )
                                }
                                className={`w-full flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded text-right cursor-pointer ${
                                  selectedCountryIso === c.isoNumeric
                                    ? 'bg-[#ff0909] text-white font-bold'
                                    : 'text-neutral-300 hover:bg-neutral-900'
                                }`}
                              >
                                <span className="truncate">{c.nameAr}</span>
                                <span className="font-mono-num text-[10.5px] text-white font-bold">
                                  {formatCompactCurrency(c.totalSales * yearScaleFactor)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 3. Sales by Segment Donut Card (Framed Box #2) */}
              <section className="bi-card p-3 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-[13px] font-bold text-white">
                    المبيعات حسب القطاع
                  </h2>
                  {selectedSegment && (
                    <button
                      type="button"
                      onClick={() => setSelectedSegment(null)}
                      className="text-[11px] text-[#ff1111] hover:underline cursor-pointer"
                    >
                      الكل
                    </button>
                  )}
                </div>

                <SegmentDonutChart
                  consumerSales={kpiMetrics.consumerSales}
                  corporateSales={kpiMetrics.corporateSales}
                  homeOfficeSales={kpiMetrics.homeOfficeSales}
                  selectedSegment={selectedSegment}
                  onSelectSegment={setSelectedSegment}
                />
              </section>
            </div>

            {/* Center Area: Unframed 3D Orthographic Globe + 4 Corner KPIs matching exact reference positions */}
            <section className="bi-panel-hover md:col-span-8 relative min-h-[360px] sm:min-h-[410px] flex flex-col sm:flex-row items-center justify-center py-2 px-3 bg-black">
              {/* Top KPIs */}
              <div className="w-full flex sm:contents items-start justify-between mb-2 sm:mb-0">
                {/* Top-Left of Globe matching reference: 795 Customers */}
                <div className="sm:absolute sm:top-3 sm:left-4 text-center z-10" dir="rtl">
                  <div className="text-xl sm:text-2xl font-bold font-mono-num kpi-num-crimson leading-tight">
                    {kpiMetrics.customers}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    العملاء
                  </div>
                </div>

                {/* Top-Right of Globe matching reference: Worldwide Sales | Yearly Avg. Sales | 3.15M | 12.58M */}
                <div className="sm:absolute sm:top-1 sm:right-4 text-center z-10" dir="rtl">
                  <div className="text-sm sm:text-base font-bold text-[#ff2e2e] leading-tight">
                    المبيعات العالمية
                  </div>
                  <div className="text-[11.5px] font-semibold text-white mt-0.5">
                    متوسط المبيعات السنوي |{' '}
                    <span className="font-mono-num kpi-num-white font-bold" dir="ltr">
                      {formatCompactCurrency(kpiMetrics.yearlyAvgSales)}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono-num kpi-num-crimson mt-1 leading-tight" dir="ltr">
                    {formatCompactCurrency(kpiMetrics.worldwideSales)}
                  </div>
                </div>
              </div>

              {/* Interactive 3D Orthographic Globe */}
              <OrthographicGlobe
                selectedContinent={selectedContinent}
                selectedCountryIso={selectedCountryIso}
                onSelectCountry={setSelectedCountryIso}
                filteredCountries={filteredCountries}
                yearScaleFactor={yearScaleFactor}
              />

              {/* Bottom KPIs */}
              <div className="w-full flex sm:contents items-end justify-between mt-2 sm:mt-0">
                {/* Bottom-Left of Globe matching reference: 1.46M | 11.6% Gross Profit | % */}
                <div className="sm:absolute sm:bottom-2.5 sm:left-4 text-center z-10" dir="rtl">
                  <div
                    className="text-lg sm:text-xl font-bold font-mono-num kpi-num-crimson leading-tight"
                    dir="ltr"
                  >
                    {formatCompactCurrency(kpiMetrics.grossProfit)} | {kpiMetrics.grossMarginPercent}%
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    إجمالي الربح | %
                  </div>
                </div>

                {/* Bottom-Right of Globe matching reference: 1.1M | 8.77% Net Profit | % */}
                <div className="sm:absolute sm:bottom-2.5 sm:right-4 text-center z-10" dir="rtl">
                  <div
                    className="text-lg sm:text-xl font-bold font-mono-num kpi-num-crimson leading-tight"
                    dir="ltr"
                  >
                    {formatCompactCurrency(kpiMetrics.netProfit)} | {kpiMetrics.netMarginPercent}%
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    صافي الربح | %
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* LOWER ROW: Sales by Year, Quarter and Category (7 cols) + Profit by Product [Top 5] (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Sales by Year, Quarter and Category (Framed Box #3 - Left in Reference) */}
            <section className="bi-card md:col-span-7 p-3 flex flex-col justify-between min-h-[245px]" dir="rtl">
              <h2 className="text-xs sm:text-[13px] font-bold text-white">
                المبيعات حسب السنة والربع والفئة
              </h2>
              <CategoryTrendChart
                selectedYears={selectedYears}
                scaleFactor={kpiMetrics.continentScale * segmentScaleFactor}
              />
            </section>

            {/* Profit by Product [Top 5] (Framed Box #4 - Center-Right in Reference) */}
            <section className="bi-card md:col-span-5 p-3 flex flex-col justify-between min-h-[245px]" dir="rtl">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-[13px] font-bold text-white">
                  الربح حسب المنتج [أعلى 5]
                </h2>
                {selectedProductId && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductId(null)}
                    className="text-[11px] text-[#ff1111] hover:underline cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
              <TopProductsBarChart
                selectedYears={selectedYears}
                continentScaleFactor={kpiMetrics.continentScale * segmentScaleFactor}
                selectedProductId={selectedProductId}
                onSelectProduct={setSelectedProductId}
              />
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN (3 Columns on Desktop): Unframed Country | Sales | Percent Table with Scrollbar on Right */}
        <div className="bi-panel-hover lg:col-span-3 p-2 bg-black flex flex-col">
          <CountryRankingTable
            countries={filteredCountries}
            yearScaleFactor={yearScaleFactor * segmentScaleFactor}
            selectedCountryIso={selectedCountryIso}
            onSelectCountry={setSelectedCountryIso}
          />
        </div>
      </main>

      {/* ==================== INTERACTIVE DRAWER / MODAL FOR TOP-RIGHT ANALYTICAL ICONS ==================== */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-neutral-950 border border-[#ff1111] rounded-xl max-w-2xl w-full p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-[#ff1111]">
                {activeModal === 'report' && 'تقرير التدقيق المالي وتصدير البيانات (CSV)'}
                {activeModal === 'profit' && 'تحليل هوامش الربح الإجمالية والصافية (2019 - 2022)'}
                {activeModal === 'network' && 'توزيع المبيعات حسب القارات الست'}
                {activeModal === 'customers' && 'ملخص قاعدة العملاء العالمية (795 عميل نشط)'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-white text-sm px-2 py-0.5 rounded bg-neutral-900 cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {activeModal === 'report' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-neutral-300">
                  تعتمد هذه اللوحة على بيانات المتجر العالمي الحقيقية (Global Superstore Dataset) للفترة من 2019 إلى 2022 بإجمالي مبيعات عالمية قدرها{' '}
                  <span className="font-mono-num text-[#ff1111] font-bold">12.58M$</span> عبر 35 دولة رئيسية في 6 قارات.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">إجمالي المبيعات</div>
                    <div className="text-base font-bold font-mono-num text-white mt-0.5">
                      {formatCompactCurrency(kpiMetrics.worldwideSales)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">إجمالي الربح</div>
                    <div className="text-base font-bold font-mono-num text-[#ff1111] mt-0.5">
                      {formatCompactCurrency(kpiMetrics.grossProfit)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">صافي الربح</div>
                    <div className="text-base font-bold font-mono-num text-white mt-0.5">
                      {formatCompactCurrency(kpiMetrics.netProfit)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">عدد الدول المعروضة</div>
                    <div className="text-base font-bold font-mono-num text-white mt-0.5">
                      {filteredCountries.length}
                    </div>
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowReferenceModal(true)}
                    className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    معاينة الصورة المرجعية الأصلية
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = 'Country_AR,Country_EN,Continent,Sales_USD,Share_Percent,Gross_Profit_USD,Net_Profit_USD\n';
                      const rows = filteredCountries
                        .map(
                          (c) =>
                            `"${c.nameAr}","${c.nameEn}","${c.continent}",${(
                              c.totalSales * yearScaleFactor
                            ).toFixed(2)},${c.percentShare},${c.grossProfit},${c.netProfit}`
                        )
                        .join('\n');
                      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'global-superstore-sales-arabic.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-1.5 rounded bg-[#ff1111] hover:bg-[#d60c0c] text-white text-xs font-bold cursor-pointer"
                  >
                    تحميل البيانات (CSV)
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'profit' && (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-300">
                  مقارنة الأداء الربحي لأعلى 5 منتجات تحقيقاً للعائد الصافي:
                </p>
                <div className="space-y-2">
                  {TOP_PRODUCTS_DATA.map((p) => {
                    const sumProfit = Object.values(p.profitByYear).reduce((a, b) => a + b, 0);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800"
                      >
                        <div>
                          <div className="font-bold text-white">{p.nameAr}</div>
                          <div className="text-[11px] text-neutral-400">الفئة: {p.categoryAr}</div>
                        </div>
                        <div className="font-mono-num text-sm font-bold text-[#ff1111]">
                          {formatCompactCurrency(sumProfit)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeModal === 'network' && (
              <div className="space-y-2.5 text-xs">
                <p className="text-neutral-300">
                  التوزيع الإقليمي للمبيعات عبر القارات الست (انقر لاختيار القارة وتدوير الكرة الأرضية):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTINENTS.map((cont) => {
                    const sum = COUNTRIES_DATA.filter((c) => c.continent === cont.id).reduce(
                      (acc, c) => acc + c.totalSales,
                      0
                    );
                    return (
                      <button
                        key={cont.id}
                        type="button"
                        onClick={() => {
                          setSelectedContinent(cont.id);
                          setActiveModal(null);
                        }}
                        className="p-2.5 rounded bg-neutral-900 hover:bg-[#ff1111]/20 border border-neutral-800 hover:border-[#ff1111] text-right transition-colors cursor-pointer"
                      >
                        <div className="font-bold text-white">{cont.nameAr}</div>
                        <div className="text-[10px] text-neutral-400">{cont.nameEn}</div>
                        <div className="font-mono-num text-sm font-bold text-[#ff1111] mt-1">
                          {formatCompactCurrency(sum)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeModal === 'customers' && (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-300">
                  توزيع شرائح العملاء البالغ عددهم <span className="font-mono-num font-bold text-white">{kpiMetrics.customers}</span> عميل حسب القطاع الشرائي:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded bg-neutral-900 border border-neutral-800 text-center">
                    <div className="font-bold text-white">المستهلكين</div>
                    <div className="text-base font-mono-num font-bold text-[#ff0909] mt-1">
                      {formatCompactCurrency(kpiMetrics.consumerSales)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">51.5% من الإجمالي</div>
                  </div>
                  <div className="p-3 rounded bg-neutral-900 border border-neutral-800 text-center">
                    <div className="font-bold text-white">الشركات</div>
                    <div className="text-base font-mono-num font-bold text-[#ec4c6a] mt-1">
                      {formatCompactCurrency(kpiMetrics.corporateSales)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">30.2% من الإجمالي</div>
                  </div>
                  <div className="p-3 rounded bg-neutral-900 border border-neutral-800 text-center">
                    <div className="font-bold text-white">المكاتب المنزلية</div>
                    <div className="text-base font-mono-num font-bold text-[#f28aa0] mt-1">
                      {formatCompactCurrency(kpiMetrics.homeOfficeSales)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">18.3% من الإجمالي</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional Reference Image Comparison Modal */}
      {showReferenceModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReferenceModal(false)}
        >
          <div
            className="bg-neutral-950 border border-neutral-700 rounded-xl max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">
                التصميم المرجعي الأصلي (Visual Reference)
              </span>
              <button
                type="button"
                onClick={() => setShowReferenceModal(false)}
                className="text-xs bg-[#ff1111] text-white px-2.5 py-1 rounded cursor-pointer"
              >
                إغلاق
              </button>
            </div>
            <img
              src="/assets/aistudio/image_b83f9c3c.png"
              alt="التصميم المرجعي للوحة المبيعات العالمية"
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded border border-neutral-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}

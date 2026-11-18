import React, { useState } from 'react';
import { CONTINENTS, CountryRecord, formatCompactCurrency } from '../data/superstoreData';

interface CountryRankingTableProps {
  countries: CountryRecord[];
  yearScaleFactor: number;
  selectedCountryIso: string | null;
  onSelectCountry: (isoNumeric: string | null) => void;
}

export const CountryRankingTable: React.FC<CountryRankingTableProps> = ({
  countries,
  yearScaleFactor,
  selectedCountryIso,
  onSelectCountry,
}) => {
  const [sortAsc, setSortAsc] = useState(false);

  const sortedCountries = [...countries].sort((a, b) =>
    sortAsc ? a.totalSales - b.totalSales : b.totalSales - a.totalSales
  );

  // Sum of currently displayed countries to compute dynamic share % when filtered by continent
  const totalFilteredSales = Math.max(
    1,
    countries.reduce((sum, c) => sum + c.totalSales * yearScaleFactor, 0)
  );
  const isAllCountriesShowing = countries.length === 35;

  const maxSales = Math.max(...countries.map((c) => c.totalSales * yearScaleFactor), 1);

  return (
    <div className="flex flex-col h-full bg-black text-white select-none" dir="ltr">
      {/* ==================== DESKTOP TABLE HEADER (md and up) ==================== */}
      <div className="hidden md:flex items-center justify-between pb-1.5 mb-1 border-b border-neutral-900 text-xs font-bold text-white px-1">
        <div className="w-[46%] truncate text-left">الدولة</div>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          title="فرز حسب حجم المبيعات"
          className="w-[22%] flex items-center justify-start text-neutral-200 hover:text-[#ff1111] cursor-pointer"
        >
          <span className="text-[9px] leading-none">{sortAsc ? '▲' : '▼'}</span>
        </button>
        <div className="w-[32%] text-right font-bold whitespace-nowrap">
          المبيعات | النسبة
        </div>
      </div>

      {/* ==================== MOBILE CARDS HEADER (< md) ==================== */}
      <div className="flex md:hidden items-center justify-between pb-2.5 border-b border-neutral-800 px-1" dir="rtl">
        <div>
          <h3 className="text-xs font-bold text-white">
            ترتيب المبيعات حسب الدولة ({sortedCountries.length})
          </h3>
          <p className="text-[10px] text-neutral-400">
            اضغط على أي بطاقة لتحديد الدولة على الكرة الأرضية
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1.5 text-[11px] font-semibold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <span>{sortAsc ? 'الأقل مبيعاً' : 'الأعلى مبيعاً'}</span>
          <span className="text-[#ff1111] text-[10px]">{sortAsc ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* ==================== EMPTY STATE ==================== */}
      {sortedCountries.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500" dir="rtl">
          لا توجد دول مطابقة لفلتر البحث الحالي
        </div>
      ) : (
        <>
          {/* ==================== MOBILE CARDS VIEW (< md) ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 md:hidden max-h-[520px] overflow-y-auto pr-0.5 pl-1 pb-1" dir="rtl">
            {sortedCountries.map((country, idx) => {
              const scaledSales = country.totalSales * yearScaleFactor;
              const barWidthPercent = Math.max(
                3,
                Math.round((scaledSales / maxSales) * 100)
              );
              const displayPercent = isAllCountriesShowing
                ? country.percentShare
                : Number(((scaledSales / totalFilteredSales) * 100).toFixed(2));
              const isSelected = selectedCountryIso === country.isoNumeric;
              const continentAr =
                CONTINENTS.find((ct) => ct.id === country.continent)?.nameAr ||
                country.continent;
              const rankNumber = sortAsc ? sortedCountries.length - idx : idx + 1;

              return (
                <button
                  key={country.isoNumeric}
                  type="button"
                  onClick={() =>
                    onSelectCountry(isSelected ? null : country.isoNumeric)
                  }
                  className={`bi-card w-full flex flex-col justify-between p-3 text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff1111]/15 border-[#ff1111] ring-1 ring-[#ff1111]'
                      : 'bg-neutral-950/90 border-neutral-700'
                  }`}
                >
                  {/* Top Row: Rank + Flag + Country Arabic Name + Continent */}
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-mono-num font-bold text-[#ff1111] shrink-0">
                        #{rankNumber}
                      </span>
                      <FlagBadge iso2={country.iso2} name={country.nameAr} size="lg" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {country.nameAr}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {continentAr}
                        </div>
                      </div>
                    </div>

                    {/* Sales & Share Metric Column */}
                    <div className="text-left shrink-0" dir="ltr">
                      <div className="text-xs font-bold font-mono-num kpi-num-white">
                        {formatCompactCurrency(scaledSales)}
                      </div>
                      <div className="text-[11px] font-mono-num font-bold kpi-num-crimson">
                        {displayPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Horizontal Red Sales Bar */}
                  <div className="w-full h-2 bg-neutral-900 rounded-sm overflow-hidden my-2.5">
                    <div
                      style={{ width: `${barWidthPercent}%` }}
                      className="h-full bg-[#ff0909] transition-all duration-300"
                    />
                  </div>

                  {/* Bottom Row: Secondary Country Metrics */}
                  <div className="flex items-center justify-between text-[10.5px] text-neutral-300 pt-1 border-t border-neutral-900 w-full">
                    <span>
                      العملاء:{' '}
                      <strong className="font-mono-num text-white font-bold">
                        {Math.max(1, Math.round(country.customers * yearScaleFactor))}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      إجمالي الربح:{' '}
                      <strong className="font-mono-num text-white font-bold" dir="ltr">
                        {formatCompactCurrency(country.grossProfit * yearScaleFactor)}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      صافي:{' '}
                      <strong className="font-mono-num kpi-num-crimson font-bold" dir="ltr">
                        {formatCompactCurrency(country.netProfit * yearScaleFactor)}
                      </strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ==================== DESKTOP TABLE VIEW (md and up) matching reference image ==================== */}
          <div className="hidden md:block flex-1 overflow-y-auto pr-1.5 space-y-[3px] max-h-[630px]">
            {sortedCountries.map((country) => {
              const scaledSales = country.totalSales * yearScaleFactor;
              const barWidthPercent = Math.max(
                2,
                Math.round((scaledSales / maxSales) * 100)
              );
              const displayPercent = isAllCountriesShowing
                ? country.percentShare
                : Number(((scaledSales / totalFilteredSales) * 100).toFixed(2));
              const isSelected = selectedCountryIso === country.isoNumeric;

              return (
                <button
                  key={country.isoNumeric}
                  type="button"
                  onClick={() =>
                    onSelectCountry(isSelected ? null : country.isoNumeric)
                  }
                  className={`w-full flex items-center justify-between py-[2.5px] px-1 rounded transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff1111]/25 ring-1 ring-[#ff1111]'
                      : 'hover:bg-neutral-900/90'
                  }`}
                >
                  {/* Flag + Country Name on Left */}
                  <div className="w-[46%] flex items-center gap-2 min-w-0 pr-1 text-left">
                    <FlagBadge iso2={country.iso2} name={country.nameAr} />
                    <span className="text-[11px] font-semibold text-neutral-100 block truncate">
                      {country.nameAr}
                    </span>
                  </div>

                  {/* Horizontal Red Progress Bar in Middle */}
                  <div className="w-[22%] flex items-center justify-start px-1">
                    <div className="w-full h-[14px] bg-transparent flex items-center">
                      <div
                        style={{ width: `${barWidthPercent}%` }}
                        className="h-full bg-[#ff0909] transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Sales | Percent Tabular Figure on Right */}
                  <div className="w-[32%] text-right font-mono-num text-[11.5px] font-bold text-white kpi-num-white whitespace-nowrap">
                    {formatCompactCurrency(scaledSales)} | {displayPercent}%
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Crisp inline SVG flag renderer for all 35 countries so that zero external images can break.
 */
const FlagBadge: React.FC<{ iso2: string; name: string; size?: 'sm' | 'lg' }> = ({
  iso2,
  name,
  size = 'sm',
}) => {
  const colors: Record<string, [string, string, string]> = {
    us: ['#b22234', '#ffffff', '#3c3b6e'],
    au: ['#00008b', '#ffffff', '#ff0000'],
    fr: ['#002395', '#ffffff', '#ed2939'],
    cn: ['#de2910', '#ffde00', '#de2910'],
    de: ['#000000', '#dd0000', '#ffce00'],
    mx: ['#006847', '#ffffff', '#ce1126'],
    in: ['#ff9933', '#ffffff', '#138808'],
    gb: ['#012169', '#ffffff', '#c8102e'],
    id: ['#ff0000', '#ffffff', '#ffffff'],
    br: ['#009c3b', '#ffdf00', '#002776'],
    it: ['#009246', '#ffffff', '#ce2b37'],
    es: ['#aa151b', '#f1bf00', '#aa151b'],
    ph: ['#0038a8', '#ce1126', '#fcd116'],
    sv: ['#0f47af', '#ffffff', '#0f47af'],
    nz: ['#00247d', '#cc142b', '#ffffff'],
    cu: ['#002a8f', '#ffffff', '#cb1515'],
    ni: ['#0067c6', '#ffffff', '#0067c6'],
    gt: ['#4997d0', '#ffffff', '#4997d0'],
    do: ['#002d62', '#ffffff', '#ce1126'],
    ir: ['#239f40', '#ffffff', '#da0000'],
    tr: ['#e30a17', '#ffffff', '#e30a17'],
    jp: ['#ffffff', '#bc002d', '#ffffff'],
    za: ['#007749', '#ffb81c', '#de3831'],
    at: ['#ed2939', '#ffffff', '#ed2939'],
    hn: ['#0073cf', '#ffffff', '#0073cf'],
    cd: ['#007fff', '#f7d618', '#ce1021'],
    ma: ['#c1272d', '#006233', '#c1272d'],
    eg: ['#ce1126', '#ffffff', '#000000'],
    sa: ['#006c35', '#ffffff', '#006c35'],
    ng: ['#008751', '#ffffff', '#008751'],
    ru: ['#ffffff', '#0039a6', '#d52b1e'],
    ar: ['#74acdf', '#ffffff', '#74acdf'],
    ca: ['#ff0000', '#ffffff', '#ff0000'],
    co: ['#fcd116', '#003893', '#ce1126'],
    dz: ['#006233', '#ffffff', '#d21034'],
    cl: ['#0039a6', '#ffffff', '#d52b1e'],
  };

  const [c1, c2, c3] = colors[iso2] || ['#e11d48', '#ffffff', '#1e293b'];
  const dimClass = size === 'lg' ? 'w-[24px] h-[16px]' : 'w-[19px] h-[13px]';

  return (
    <span
      title={name}
      className={`${dimClass} shrink-0 rounded-[1.5px] overflow-hidden inline-flex flex-col border border-neutral-700/80 shadow-xs`}
    >
      {iso2 === 'jp' ? (
        <span className="w-full h-full bg-white flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#bc002d]" />
        </span>
      ) : iso2 === 'tr' || iso2 === 'cn' || iso2 === 'ma' ? (
        <span
          style={{ backgroundColor: c1 }}
          className="w-full h-full flex items-center justify-center"
        >
          <span
            style={{ backgroundColor: c2 }}
            className="w-1.5 h-1.5 rounded-full"
          />
        </span>
      ) : iso2 === 'fr' || iso2 === 'it' || iso2 === 'mx' || iso2 === 'ng' || iso2 === 'ca' ? (
        <span className="w-full h-full flex flex-row">
          <span style={{ backgroundColor: c1 }} className="w-1/3 h-full" />
          <span style={{ backgroundColor: c2 }} className="w-1/3 h-full" />
          <span style={{ backgroundColor: c3 }} className="w-1/3 h-full" />
        </span>
      ) : (
        <>
          <span style={{ backgroundColor: c1 }} className="w-full h-1/3" />
          <span style={{ backgroundColor: c2 }} className="w-full h-1/3" />
          <span style={{ backgroundColor: c3 }} className="w-full h-1/3" />
        </>
      )}
    </span>
  );
};

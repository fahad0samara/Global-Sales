import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geoOrthographic, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { ContinentId, COUNTRIES_DATA, CountryRecord, formatCompactCurrency } from '../data/superstoreData';

interface OrthographicGlobeProps {
  selectedContinent: ContinentId | null;
  selectedCountryIso: string | null;
  onSelectCountry: (isoNumeric: string | null) => void;
  filteredCountries: CountryRecord[];
  yearScaleFactor: number;
}

// Color ramp matching the exact crimson/pink shades in the visual reference image
function getCountryFillColor(
  isoId: string,
  countryMap: Map<string, CountryRecord>,
  selectedCountryIso: string | null,
  selectedContinent: ContinentId | null
): string {
  const paddedId = isoId.padStart(3, '0');
  const record = countryMap.get(paddedId);

  if (selectedCountryIso && paddedId === selectedCountryIso) {
    return '#ff1111';
  }

  // Russia (643), China (156), France (250), Germany (276), UK (826), USA (840), Australia (036), Spain (724), Italy (380)
  const highCrimsonIsos = new Set(['840', '036', '250', '156', '276', '484', '826', '643', '724', '380']);

  if (record) {
    if (selectedContinent && record.continent !== selectedContinent) {
      return '#4a1c24';
    }
    if (highCrimsonIsos.has(paddedId) || record.totalSales >= 500_000) {
      return '#f20d0d'; // Bright Crimson
    }
    if (record.totalSales >= 250_000) {
      return '#e64564'; // Deep Rose
    }
    if (record.totalSales >= 110_000) {
      return '#ea6384'; // Medium Pink-Coral
    }
    return '#f08aa3'; // Soft Rose Pink
  }

  const hash = paddedId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  if (selectedContinent) {
    return '#3b171e';
  }
  const palette = ['#e45c7c', '#eb7692', '#f398ad', '#d64566', '#eea3b5'];
  return palette[hash % palette.length];
}

export const OrthographicGlobe: React.FC<OrthographicGlobeProps> = ({
  selectedContinent,
  selectedCountryIso,
  onSelectCountry,
  filteredCountries,
  yearScaleFactor,
}) => {
  // Default rotation centered on Europe / Africa / Middle East / Asia exactly as in the reference image
  const [rotation, setRotation] = useState<[number, number, number]>([-26, -24, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; rot: [number, number, number] } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{
    nameAr: string;
    nameEn: string;
    salesText: string;
    percentText: string;
  } | null>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryRecord>();
    COUNTRIES_DATA.forEach((c) => map.set(c.isoNumeric.padStart(3, '0'), c));
    return map;
  }, []);

  const filteredIsoSet = useMemo(() => {
    return new Set(filteredCountries.map((c) => c.isoNumeric.padStart(3, '0')));
  }, [filteredCountries]);

  // Smoothly rotate globe when user clicks a continent or specific country
  useEffect(() => {
    if (selectedCountryIso) {
      const target = countryMap.get(selectedCountryIso.padStart(3, '0'));
      if (target) {
        setRotation([-target.lonLat[0], -target.lonLat[1], 0]);
        return;
      }
    }
    if (selectedContinent) {
      const centers: Record<ContinentId, [number, number, number]> = {
        Africa: [-20, -5, 0],
        Asia: [-90, -30, 0],
        Europe: [-15, -48, 0],
        'North America': [95, -38, 0],
        Oceania: [-138, 25, 0],
        'South America': [60, 18, 0],
      };
      setRotation(centers[selectedContinent]);
    } else if (!selectedCountryIso) {
      setRotation([-26, -24, 0]);
    }
  }, [selectedContinent, selectedCountryIso, countryMap]);

  const countriesGeo = useMemo(() => {
    const topo = worldData as unknown as Parameters<typeof topojson.feature>[0];
    const obj = (worldData as unknown as { objects: { countries: Parameters<typeof topojson.feature>[1] } }).objects.countries;
    const feat = topojson.feature(topo, obj) as unknown as {
      features: Array<{ id?: string | number; properties?: { name?: string }; geometry: unknown }>;
    };
    return feat.features;
  }, []);

  const size = 400;
  const projection = useMemo(() => {
    return geoOrthographic()
      .scale(192)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .rotate(rotation);
  }, [rotation]);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: [...rotation] as [number, number, number],
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const sensitivity = 0.35;
    const newLambda = dragStartRef.current.rot[0] + dx * sensitivity;
    const newPhi = Math.max(-75, Math.min(75, dragStartRef.current.rot[1] - dy * sensitivity));
    setRotation([newLambda, newPhi, 0]);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div className="relative flex items-center justify-center select-none my-1">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={`w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] xl:w-[375px] xl:h-[375px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="خريطة الكرة الأرضية التفاعلية للمبيعات العالمية"
      >
        <defs>
          <radialGradient id="globe-ocean" cx="45%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#0b0305" />
            <stop offset="75%" stopColor="#030101" />
            <stop offset="100%" stopColor="#140407" />
          </radialGradient>
        </defs>

        {/* Globe sphere background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={192}
          fill="url(#globe-ocean)"
          stroke="#2c0e13"
          strokeWidth={1}
        />

        {/* Country Polygons */}
        <g>
          {countriesGeo.map((feature, idx) => {
            const rawId = String(feature.id ?? idx).padStart(3, '0');
            const d = pathGenerator(feature as unknown as Parameters<typeof pathGenerator>[0]);
            if (!d) return null;

            const record = countryMap.get(rawId);
            const isSelected = selectedCountryIso === rawId;
            const isFilteredIn = filteredIsoSet.has(rawId);
            const fill = getCountryFillColor(rawId, countryMap, selectedCountryIso, selectedContinent);

            return (
              <path
                key={rawId + idx}
                d={d}
                fill={fill}
                fillOpacity={selectedContinent && record && !isFilteredIn ? 0.35 : 0.96}
                stroke="#090203"
                strokeWidth={isSelected ? 1.6 : 0.55}
                className="transition-opacity duration-150 hover:brightness-125"
                onClick={(e) => {
                  e.stopPropagation();
                  if (record) {
                    onSelectCountry(isSelected ? null : rawId);
                  }
                }}
                onMouseEnter={() => {
                  if (record) {
                    const scaledSales = record.totalSales * yearScaleFactor;
                    setHoveredCountry({
                      nameAr: record.nameAr,
                      nameEn: record.nameEn,
                      salesText: formatCompactCurrency(scaledSales),
                      percentText: `${record.percentShare}%`,
                    });
                  } else if (feature.properties?.name) {
                    setHoveredCountry({
                      nameAr: feature.properties.name,
                      nameEn: feature.properties.name,
                      salesText: '—',
                      percentText: '—',
                    });
                  }
                }}
                onMouseLeave={() => setHoveredCountry(null)}
              />
            );
          })}
        </g>

        {/* Subtle outer rim highlight */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={192}
          fill="none"
          stroke="#ff1111"
          strokeOpacity={0.18}
          strokeWidth={1}
          pointerEvents="none"
        />
      </svg>

      {/* Floating Tooltip on Hover */}
      {hoveredCountry && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/95 border border-[#ff1111] px-3 py-1.5 rounded-lg text-center shadow-xl z-20 min-w-[175px]">
          <div className="text-xs font-bold text-white">{hoveredCountry.nameAr}</div>
          <div className="text-[10px] text-neutral-400">{hoveredCountry.nameEn}</div>
          {hoveredCountry.salesText !== '—' && (
            <div className="mt-0.5 text-xs font-mono-num text-[#ff1111] font-bold" dir="ltr">
              {hoveredCountry.salesText} | {hoveredCountry.percentText}
            </div>
          )}
        </div>
      )}

      {/* Quick Reset / Rotate hint button when rotated or filtered */}
      {(selectedCountryIso || selectedContinent) && (
        <button
          type="button"
          onClick={() => onSelectCountry(null)}
          className="absolute top-1 left-1/2 -translate-x-1/2 text-[11px] bg-neutral-900/95 hover:bg-[#ff1111] text-neutral-200 hover:text-white border border-neutral-700 px-3 py-1 rounded-md transition-colors cursor-pointer z-20 whitespace-nowrap shadow-md"
        >
          إعادة ضبط المنظور العالمي
        </button>
      )}
    </div>
  );
};

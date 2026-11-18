import React from 'react';

export type DashboardModalTab = 'report' | 'profit' | 'network' | 'customers' | null;

interface TopHeaderIconsProps {
  activeModal: DashboardModalTab;
  onSelectModal: (tab: DashboardModalTab) => void;
}

/**
 * Recreates the exact 4 analytical outline icons from the top-right corner of the visual reference:
 * 1. Red Document with Magnifying Glass (تقرير التدقيق والبحث)
 * 2. White Dollar Chart & Clock (تحليل الأرباح والزمن)
 * 3. White Connected Network Nodes (شبكة التوزيع العالمية)
 * 4. White Customer Support Representative (ملخص العملاء)
 */
export const TopHeaderIcons: React.FC<TopHeaderIconsProps> = ({
  activeModal,
  onSelectModal,
}) => {
  return (
    <div className="flex items-center gap-4 sm:gap-5 shrink-0">
      {/* 1. Red Document + Magnifying Glass Icon (Highlighted in Crimson Red in reference) */}
      <button
        type="button"
        onClick={() => onSelectModal(activeModal === 'report' ? null : 'report')}
        title="تقرير المبيعات التفصيلي والبحث"
        className={`group relative p-1 transition-transform hover:scale-105 cursor-pointer ${
          activeModal === 'report' ? 'ring-1 ring-[#ff1111] rounded' : ''
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 sm:w-11 sm:h-11 text-[#ff1111]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Document outline */}
          <path d="M10 6h18l8 8v26a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <path d="M28 6v8h8" />
          {/* Document lines */}
          <line x1="13" y1="16" x2="23" y2="16" />
          <line x1="13" y1="21" x2="27" y2="21" />
          <line x1="13" y1="26" x2="24" y2="26" />
          <line x1="13" y1="31" x2="21" y2="31" />
          <line x1="13" y1="36" x2="19" y2="36" />
          {/* Magnifying glass overlay */}
          <circle cx="31" cy="31" r="7" fill="#000000" stroke="currentColor" strokeWidth="2.3" />
          <circle cx="31" cy="31" r="4" stroke="currentColor" strokeWidth="1.4" />
          <line x1="36.2" y1="36.2" x2="43" y2="43" strokeWidth="3" />
        </svg>
      </button>

      {/* 2. White Financial Growth / Dollar + Clock Icon */}
      <button
        type="button"
        onClick={() => onSelectModal(activeModal === 'profit' ? null : 'profit')}
        title="مؤشرات الربحية والأداء الزمني"
        className={`group relative p-1 transition-transform hover:scale-105 cursor-pointer ${
          activeModal === 'profit' ? 'text-[#ff1111]' : 'text-white hover:text-[#ff4d4d]'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 sm:w-11 sm:h-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Vertical & Horizontal Axis */}
          <polyline points="8 8 8 40 40 40" />
          {/* Dollar symbol top-left */}
          <path d="M16 12h-3a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3" />
          <line x1="14.5" y1="10" x2="14.5" y2="22" />
          {/* Clock symbol top-right */}
          <circle cx="30" cy="15" r="6" />
          <polyline points="30 12 30 15 32.5 16.5" />
          {/* Ascending mountain/trend curve */}
          <path d="M11 39l8-13 7 6 10-8" />
          <path d="M13 39h22l-5-7-6 3-5-5-6 9z" fill="currentColor" fillOpacity="0.18" />
        </svg>
      </button>

      {/* 3. White Connected Network Nodes Icon */}
      <button
        type="button"
        onClick={() => onSelectModal(activeModal === 'network' ? null : 'network')}
        title="شبكة التوزيع والقارات"
        className={`group relative p-1 transition-transform hover:scale-105 cursor-pointer ${
          activeModal === 'network' ? 'text-[#ff1111]' : 'text-white hover:text-[#ff4d4d]'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 sm:w-11 sm:h-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Connection lines */}
          <line x1="22" y1="22" x2="12" y2="12" />
          <line x1="22" y1="22" x2="36" y2="12" />
          <line x1="22" y1="22" x2="37" y2="28" />
          <line x1="22" y1="22" x2="14" y2="36" />
          <line x1="22" y1="22" x2="27" y2="39" />
          {/* Outer nodes */}
          <circle cx="11" cy="11" r="4.5" fill="#000" />
          <circle cx="37" cy="11" r="4.5" fill="#000" />
          <circle cx="38" cy="28" r="4.5" fill="#000" />
          <circle cx="13" cy="36" r="4.5" fill="#000" />
          <circle cx="27" cy="39" r="3.8" fill="#000" />
          {/* Center hub node */}
          <circle cx="22" cy="22" r="5.5" fill="currentColor" />
        </svg>
      </button>

      {/* 4. White Executive Customer / Agent Icon */}
      <button
        type="button"
        onClick={() => onSelectModal(activeModal === 'customers' ? null : 'customers')}
        title="تحليل شرائح العملاء (795 عميل)"
        className={`group relative p-1 transition-transform hover:scale-105 cursor-pointer ${
          activeModal === 'customers' ? 'text-[#ff1111]' : 'text-white hover:text-[#ff4d4d]'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 sm:w-11 sm:h-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Head & Hair */}
          <circle cx="20" cy="15" r="7" />
          <path d="M14 13c2-3 9-3 12 0" />
          {/* Shoulders / Suit */}
          <path d="M9 40v-4a9 9 0 0 1 9-9h4a9 9 0 0 1 9 9v4" />
          <polyline points="17 27 20 34 23 27" />
          {/* Badge / Profile card on right */}
          <rect x="31" y="13" width="11" height="16" rx="1.5" />
          <line x1="34" y1="18" x2="39" y2="18" />
          <line x1="34" y1="22" x2="39" y2="22" />
          <line x1="34" y1="25" x2="37" y2="25" />
        </svg>
      </button>
    </div>
  );
};

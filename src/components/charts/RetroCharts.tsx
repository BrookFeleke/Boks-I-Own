/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

// Color palette for high-contrast retro styling
const RETRO_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Mint Turquoise
  '#FFE66D', // Vivid Yellow
  '#A18CD1', // Pastelly Violet
  '#F3A683', // Peach
  '#78E08F', // Lime Green
  '#60A5FA', // Sky Blue
  '#F472B6'  // Rose Pink
];

// Helper to resolve colors
const getColor = (index: number) => RETRO_COLORS[index % RETRO_COLORS.length];

interface ChartDataItem {
  name: string;
  count?: number;
  totalCount?: number;
  primaryCount?: number;
}

interface BarChartProps {
  data: ChartDataItem[];
  valueKey?: 'count' | 'totalCount';
  maxItems?: number;
}

export const RetroBarChart: React.FC<BarChartProps> = ({ data, valueKey = 'count', maxItems = 6 }) => {
  const visibleData = data.slice(0, maxItems);
  const maxVal = Math.max(...visibleData.map(d => Number(d[valueKey] || 0)), 1);

  return (
    <div className="space-y-4 font-sans">
      {visibleData.map((item, idx) => {
        const val = Number(item[valueKey] || 0);
        const percent = Math.max((val / maxVal) * 100, 4); // minimum 4% so it's visible

        return (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold text-gray-800">
              <span className="truncate">{item.name}</span>
              <span>{val} books</span>
            </div>
            <div className="relative h-6 w-full border-2 border-black bg-white rounded shadow-[2px_2px_0px_#000000]">
              <div 
                className="h-full border-r-2 border-black transition-all duration-500"
                style={{ 
                  width: `${percent}%`,
                  backgroundColor: getColor(idx)
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DonutChartProps {
  data: ChartDataItem[];
}

export const RetroDonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  
  if (total === 0) {
    return <div className="text-center font-mono text-xs py-10">No data available</div>;
  }

  // Draw simple donut segment blocks
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
      {/* Visual Chart */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#ffffff"
            strokeWidth="16"
            className="border-2 stroke-gray-100"
            pathLength={100}
          />
          {data.map((item, idx) => {
            const count = item.count || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            const strokeDash = pct;
            const strokeOffset = 100 - accumulatedPercent;
            accumulatedPercent += pct;

            // Draw slice
            return (
              <circle
                key={item.name}
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={getColor(idx)}
                strokeWidth="16"
                strokeDasharray={`${strokeDash} ${100 - strokeDash}`}
                strokeDashoffset={strokeOffset}
                pathLength={100}
                className="transition-all duration-500"
                style={{
                  stroke: getColor(idx),
                  strokeWidth: '16px'
                }}
              />
            );
          })}
          {/* Inner hole */}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="#FFF9F5" // Match retro card/canvas body
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center font-mono text-center">
          <span className="text-xl font-black">{total}</span>
          <span className="text-[9px] uppercase tracking-wider text-gray-500">Total</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-2 font-mono">
        {data.map((item, idx) => {
          const count = item.count || 0;
          if (count === 0) return null;
          const share = Math.round((count / total) * 100);
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <span className="w-3 h-3 border border-black rounded shadow-[1px_1px_0px_#000000]" style={{ backgroundColor: getColor(idx) }} />
              <span className="truncate flex-1">{item.name}</span>
              <span className="text-gray-500">({share}%)</span>
              <span className="w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TimelineStripProps {
  books: { Title: string; PublishedYear: number; Author: string }[];
}

export const CollectionTimeline: React.FC<TimelineStripProps> = ({ books }) => {
  const sorted = [...books].sort((a,b) => a.PublishedYear - b.PublishedYear);
  if (sorted.length === 0) return null;

  // Render a beautifully styled retro timeline horizontal ribbon
  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-thin">
      <div className="min-w-[800px] relative px-6 py-6 h-40 border-2 border-black bg-orange-50 rounded shadow-[3px_3px_0px_#000000]">
        
        {/* Central Ribbon Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-black border-dashed border-t border-black -translate-y-1/2" />
        
        {/* Timeline Events */}
        <div className="absolute inset-0 flex justify-between items-center px-8">
          {sorted.slice(0, 10).map((book, idx) => {
            const isTop = idx % 2 === 0;
            const displayYear = book.PublishedYear < 0 
              ? `${Math.abs(book.PublishedYear)} BC`
              : `${book.PublishedYear}`;

            return (
              <div 
                key={book.Title} 
                className={`relative flex flex-col items-center ${isTop ? '-translate-y-9' : 'translate-y-9'}`}
                style={{ width: `${100 / Math.min(sorted.length, 10)}%` }}
              >
                {/* Year Badge */}
                <div className="border border-black bg-yellow-300 font-mono text-[9px] font-black px-1.5 py-0.5 whitespace-nowrap rounded shadow-[1px_1px_0px_#000000] z-10 hover:scale-105 transition-transform">
                  {displayYear}
                </div>

                {/* Vertical Connector Line */}
                <div 
                  className={`absolute w-0.5 bg-black ${isTop ? 'top-5 h-5' : 'bottom-5 h-5'}`} 
                />

                {/* Dot */}
                <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500 border border-black z-20" style={{ [isTop ? 'top' : 'bottom']: '18px' }} />

                {/* Title tooltip on hover */}
                <div className="text-center mt-1 w-20 truncate font-sans text-[10px] font-bold text-gray-800" title={`${book.Title} by ${book.Author}`}>
                  {book.Title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

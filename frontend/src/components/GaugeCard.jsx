import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function GaugeCard({
  title,
  percentage = 66,
  todayVal = "66%",
  avgVal = "60%",
  agoVal = "40%",
  cycleVal = "80%",
  predictionVal = "24%"
}) {
  // Compute needle angle from -90 deg (0%) to +90 deg (100%)
  const angle = -90 + (percentage / 100) * 180;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        <ArrowUp className="w-4 h-4 text-churnly-600 cursor-pointer hover:scale-110 transition-transform" />
      </div>

      {/* Semi-Circle Arc Gauge Visualizer */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Background Semi-circle Arc with 3 Red Segments */}
          <div className="w-48 h-48 rounded-full border-[18px] border-transparent border-t-churnly-100 border-l-churnly-200 border-r-churnly-600 rotate-45 transform origin-center"></div>

          {/* Gauge Needle */}
          <div
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-900 origin-bottom rounded-full transition-transform duration-1000 ease-out shadow-md"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          >
            {/* Center Pivot Circle */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Center Percentage Text */}
        <span className="absolute top-2 text-sm font-extrabold text-slate-800 font-mono bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
          {percentage}%
        </span>
      </div>

      {/* Metrics List Below */}
      <div className="space-y-3 pt-2 font-sans text-xs">
        {/* Row 1: Today */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Today</span>
            <span className="font-bold text-slate-800 font-mono">{todayVal}</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-churnly-600 rounded-full" style={{ width: todayVal }}></div>
          </div>
        </div>

        {/* Row 2: Average & 12 Months Ago */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1 border-t border-slate-100 pt-1.5">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Average</span>
              <span className="font-semibold text-slate-700 font-mono">{avgVal}</span>
            </div>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-1.5">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>12 months ago</span>
              <span className="font-semibold text-slate-700 font-mono">{agoVal}</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-churnly-600 rounded-full" style={{ width: agoVal }}></div>
            </div>
          </div>
        </div>

        {/* Row 3: Last Cycle & Churn Prediction */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1 border-t border-slate-100 pt-1.5">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Last Cycle</span>
              <span className="font-semibold text-slate-700 font-mono">{cycleVal}</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-churnly-600 rounded-full" style={{ width: cycleVal }}></div>
            </div>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-1.5">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Churn Prediction</span>
              <span className="font-bold text-churnly-600 font-mono">{predictionVal}</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-churnly-600 rounded-full" style={{ width: predictionVal }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

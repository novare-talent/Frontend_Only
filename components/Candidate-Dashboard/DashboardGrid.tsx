import React from "react";

const DashboardGrid = () => {
  return (
    <div className="w-full grid grid-cols-3 grid-rows-1 gap-4 p-6">
    <div className="row-span-1 col-span-2 flex flex-col gap-4">
      {/* Large Top Right Box - 2x1 (top-right, spans 2 columns) */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-44">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-11/12"></div>
          <div className="h-3 bg-gray-200 rounded w-10/12"></div>
        </div>
      </div>
      {/* Large Bottom Right Box - 2x1 (bottom-right, spans 2 columns) */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-44">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
    <div className="row-span-2 col-span-1 flex flex-col gap-4">
    {/* Profile Completion - 1x1 (top-left) */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col h-44">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-2 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="h-3 bg-blue-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* GitHub Connect - 1x1 (bottom-left) */}
      <div className="row-span-1 col-span-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col h-44">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-2 bg-gray-200 rounded w-5/6"></div>
          <div className="h-2 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="h-3 bg-green-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DashboardGrid;
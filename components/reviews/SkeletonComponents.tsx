import React from 'react';

// Skeleton for review card
export const SkeletonCard = () => (
  <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm">
    <div className="w-1/3 h-6 bg-gray-200 rounded mb-4"></div>
    <div className="w-2/3 h-4 bg-gray-200 rounded mb-2"></div>
    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
  </div>
);

// Skeleton for review provider card
export const SkeletonProviderCard = () => (
  <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
      <div className="flex-1">
        <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="w-full h-6 bg-gray-200 rounded mb-3"></div>
    <div className="flex justify-between">
      <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
      <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Skeleton for review item
export const SkeletonReview = () => (
  <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm">
    <div className="flex justify-between mb-3">
      <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
      <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="flex items-center mb-3">
      <div className="flex space-x-1 mr-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
        ))}
      </div>
      <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
    <div className="w-5/6 h-4 bg-gray-200 rounded mb-2"></div>
    <div className="w-2/3 h-4 bg-gray-200 rounded mb-4"></div>
    <div className="flex justify-between">
      <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
      <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
); 
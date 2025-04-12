import { useTranslation } from 'next-i18next';
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: 20 | 30 | 50;
  setItemsPerPage: (value: 20 | 30 | 50) => void;
  setCurrentPage: (page: number) => void;
  totalItems: number;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  totalItems
}: PaginationControlsProps) => {
  const { t } = useTranslation('common');
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show pages with ellipsis
      
      // Always show first page
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
            currentPage === 1
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          1
        </button>
      );
      
      // Calculate range of visible pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }
      
      // Show ellipsis before startPage if needed
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="mx-1 text-gray-500">...</span>
        );
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
      
      // Show ellipsis after endPage if needed
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="mx-1 text-gray-500">...</span>
        );
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
              currentPage === totalPages
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }
    
    return pages;
  };
  
  return (
    <div className="p-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0 text-sm text-gray-600">
        {t('showing')} {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} {t('of')} {totalItems} {t('reviews')}
      </div>
      
      <div className="flex flex-wrap items-center">
        <div className="flex items-center mr-4">
          <label className="text-sm text-gray-600 mr-2">{t('show')}:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value) as 20 | 30 | 50)}
            className="text-sm border border-gray-300 rounded-md p-1"
          >
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {renderPageNumbers()}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 
import { StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { MarketPlatform } from '@prisma/client';

interface FilterControlsProps {
  filterRating: number | null;
  setFilterRating: (rating: number | null) => void;
  filterStatus: 'all' | 'read' | 'unread' | 'important' | 'replied' | 'not-replied';
  setFilterStatus: (status: 'all' | 'read' | 'unread' | 'important' | 'replied' | 'not-replied') => void;
  filterPlatform: MarketPlatform | 'all';
  setFilterPlatform: (platform: MarketPlatform | 'all') => void;
  filterDateRange: 'all' | '30days' | '90days' | '365days';
  setFilterDateRange: (range: 'all' | '30days' | '90days' | '365days') => void;
  sortBy: 'date' | 'rating' | 'sentiment';
  setSortBy: (sort: 'date' | 'rating' | 'sentiment') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export const FilterControls = ({
  filterRating,
  setFilterRating,
  filterStatus,
  setFilterStatus,
  filterPlatform,
  setFilterPlatform,
  filterDateRange,
  setFilterDateRange,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: FilterControlsProps) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Rating filters */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">{t('filter-by-rating')}:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1 text-sm rounded-full ${filterRating === null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('all')}
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-3 py-1 text-sm rounded-full flex items-center ${filterRating === rating ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {rating} <StarIcon className="w-3 h-3 ml-1" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Status filters */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">{t('filter-by-status')}:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('read')}
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('unread')}
            </button>
            <button
              onClick={() => setFilterStatus('important')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'important' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('important')}
            </button>
            <button
              onClick={() => setFilterStatus('replied')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'replied' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('replied')}
            </button>
            <button
              onClick={() => setFilterStatus('not-replied')}
              className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'not-replied' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('not-replied')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-between">
        {/* Platform and date filters */}
        <div className="flex gap-4">
          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">{t('platform')}:</label>
            <select
              value={filterPlatform === 'all' ? 'all' : filterPlatform.toString()}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterPlatform('all');
                } else {
                  setFilterPlatform(e.target.value as MarketPlatform);
                }
              }}
              className="text-sm border border-gray-200 rounded-md px-2 py-1"
            >
              <option value="all">{t('all-platforms')}</option>
              <option value={MarketPlatform.GOOGLE_MAPS}>{t('google')}</option>
              <option value={MarketPlatform.FACEBOOK}>{t('facebook')}</option>
              <option value={MarketPlatform.YELP}>{t('yelp')}</option>
            </select>
          </div>
          
          {/* Date range filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">{t('date-range')}:</label>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as 'all' | '30days' | '90days' | '365days')}
              className="text-sm border border-gray-200 rounded-md px-2 py-1"
            >
              <option value="all">{t('all-time')}</option>
              <option value="30days">{t('last-30-days')}</option>
              <option value="90days">{t('last-90-days')}</option>
              <option value="365days">{t('last-year')}</option>
            </select>
          </div>
        </div>
        
        {/* Sort controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">{t('sort-by')}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'sentiment')}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
            >
              <option value="date">{t('date')}</option>
              <option value="rating">{t('rating')}</option>
              <option value="sentiment">{t('sentiment')}</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">{t('order')}:</label>
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-3 py-1 text-sm ${sortOrder === 'desc' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t('descending')}
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-3 py-1 text-sm ${sortOrder === 'asc' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t('ascending')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
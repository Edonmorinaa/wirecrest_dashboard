import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { MarketPlatform, Review } from '@prisma/client';

interface ReviewItemProps {
  review: Review;
  onUpdateStatus: (reviewId: string, field: 'isRead' | 'isImportant' | 'reply', value: boolean | string) => Promise<void>;
  onOpenReplyModal: (review: Review) => void;
}

export const ReviewItem = ({ review, onUpdateStatus, onOpenReplyModal }: ReviewItemProps) => {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggleRead = () => {
    onUpdateStatus(review.id, 'isRead', !review.isRead);
  };
  
  const handleToggleImportant = () => {
    onUpdateStatus(review.id, 'isImportant', !review.isImportant);
  };
  
  const getPlatformIcon = (platform: MarketPlatform) => {
    switch (platform) {
      case MarketPlatform.GOOGLE_MAPS:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
          </svg>
        );
      case MarketPlatform.FACEBOOK:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case MarketPlatform.YELP:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#D32323">
            <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-2.447-3.827l-.633-1.032c-.244-.37-.199-.857.104-1.229.297-.359.89-.44 1.254-.18.04.03 1.143.81 1.143.81 2.356 1.687 2.451 1.753 2.574 1.859.121.1.226.208.284.33.053.127.068.244.064.367-.004.009-.553-.027-.674-.045zm-3.846-3.949l-3.292-1.527-.863-.398c-.372-.17-.509-.611-.325-.969.175-.342.628-.443.964-.238L17.69 13.03c.669.303.753.374.833.484.128.169.144.396.042.59-.109.198-.347.34-.576.358-.\382.002-.451-.003-.724-.186zM9.233 7.921c.21-.49.048-1.019-.385-1.357-.401-.316-.97-.293-1.377.058l-2.732 2.356c-.921.772-1.012.868-1.106 1.059-.1.19-.113.394-.044.586.068.187.201.332.376.43.437.24.449.246 5.324-1.6.311-.116.744-.326.943-.531zm.735 2.776c.009-.537-.428-.919-.865-.919-.554 0-1.015.449-1.015.998l.001 4.151c.006.522.445.942.96.942.357 0 .643-.194.81-.508.886-1.666.888-1.669.888-2.855L9.968 10.7v-.003zm-7.736 5.605c-.088-.222-.089-.457-.001-.685.086-.226.213-.389.39-.509.358-.243.419-.275 3.344-1.036 1.465-.38 1.491-.385 1.842-.385.427 0 .805.269.911.671.101.402-.092.809-.445 1.012-.163.095-3.191 1.035-3.19 1.035-.745.236-.814.254-1.615.481A4.306 4.306 0 0 0 3 18.12c-.015.006-2.95.882-.754-1.818z"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className={`p-4 border-b border-gray-100 ${!review.isRead ? 'bg-blue-50' : ''}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Review Header */}
        <div className="md:w-64 flex-shrink-0">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              {getPlatformIcon(review.source)}
            </div>
            <div>
              <div className="font-medium">{review.author || t('anonymous')}</div>
              {renderStars(review.rating)}
              <div className="text-sm text-gray-500 mt-1">{formatDate(review.date)}</div>
            </div>
          </div>
        </div>
        
        {/* Review Content */}
        <div className="flex-1">
          <div className={`${isExpanded ? '' : 'line-clamp-3'} text-gray-700`}>
            {review.text || t('no-review-text')}
          </div>
          
          {review.text && review.text.length > 150 && (
            <button 
              className="text-blue-600 text-sm mt-1 hover:underline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? t('show-less') : t('show-more')}
            </button>
          )}
          
          {/* Review Reply */}
          {review.reply && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-1">{t('your-reply')}:</div>
              <div className="text-sm text-gray-600">{review.reply}</div>
            </div>
          )}
          
          {/* Review Actions */}
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleToggleRead}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                review.isRead 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
              >
                {review.isRead ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {review.isRead ? t('mark-as-unread') : t('mark-as-read')}
            </button>
            
            <button
              onClick={handleToggleImportant}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                review.isImportant 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill={review.isImportant ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {review.isImportant ? t('remove-important') : t('mark-as-important')}
            </button>
            
            <button
              onClick={() => onOpenReplyModal(review)}
              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm flex items-center"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {review.reply ? t('edit-reply') : t('reply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
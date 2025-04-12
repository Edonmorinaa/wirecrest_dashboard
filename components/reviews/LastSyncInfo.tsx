import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';

interface LastSyncInfoProps {
  latestReviewDate: Date | null;
  onSync: () => void;
  isSyncing: boolean;
}

export const LastSyncInfo = ({ latestReviewDate, onSync, isSyncing }: LastSyncInfoProps) => {
  const { t } = useTranslation('common');
  
  const cooldownPeriod = 15; // minutes
  const canSync = !latestReviewDate || minutesSinceLastSync() >= cooldownPeriod;
  
  function minutesSinceLastSync(): number {
    if (!latestReviewDate) return Infinity;
    
    const now = new Date();
    const diffMs = now.getTime() - latestReviewDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }
  
  function getSyncAvailabilityText(): string {
    if (!latestReviewDate) return t('no-reviews-synced-yet');
    
    const minutesLeft = cooldownPeriod - minutesSinceLastSync();
    
    if (minutesLeft <= 0) {
      return t('sync-now-available');
    } else {
      return t('sync-available-in', { minutes: minutesLeft });
    }
  }
  
  function formatLastSyncDate(): string {
    if (!latestReviewDate) return '';
    return format(latestReviewDate, 'MMM d, yyyy h:mm a');
  }
  
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-gray-700">{t('last-sync')}</h3>
        <p className="text-sm text-gray-500">
          {latestReviewDate 
            ? `${formatLastSyncDate()} · ${getSyncAvailabilityText()}`
            : t('no-reviews-synced-yet')}
        </p>
      </div>
      <button
        onClick={onSync}
        disabled={isSyncing || !canSync}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          isSyncing || !canSync
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSyncing 
          ? <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('syncing')}
            </span>
          : t('sync-reviews')
        }
      </button>
    </div>
  );
}; 
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import { MarketPlatform, Review } from '@prisma/client';
import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  StarIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Import Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Add imports for dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { cn } from '../../../lib/utils';
import Link from 'next/link';

// Get platform details (similar to the logic in MarketProviderStats)
const getPlatformDetails = (platform: string) => {
  switch (platform) {
    case MarketPlatform.GOOGLE_MAPS:
      return {
        name: 'Google',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: (
          <svg
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
          </svg>
        ),
      };
    case MarketPlatform.FACEBOOK:
      return {
        name: 'Facebook',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: (
          <svg
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      };
    case MarketPlatform.YELP:
      return {
        name: 'Yelp',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: (
          <svg
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.16 12.594l-4.995 1.452c-.94.272-1.776-.513-1.484-1.411l1.374-4.233c.28-.868 1.474-1.012 2.105-.254 1.15 1.385 3 4.596 3 4.596.192.293.192.65 0 .942v-1.092zm-5.387 2.288l4.643 2.336c.771.39.74 1.512-.052 1.85l-3.783 1.614c-.83.354-1.77-.318-1.663-1.19l.505-4.035c.106-.85 1.19-1.004 1.728-.446.038-.89.622-.219.622-.129zm-1.956-8.87c-.407-.788.182-1.768 1.042-1.737l4.067.15c.86.03 1.285 1.008.756 1.731l-2.508 3.433c-.528.724-1.628.445-1.943-.493L12.817 6.01v.002zm-3.007 1.837c.433-.778 1.582-.662 1.99.202l1.979 4.194c.41.863-.356 1.781-1.298 1.55l-4.471-1.089c-.941-.23-1.12-1.489-.319-2.24l2.119-2.617zm-3.187 7.727l4.186-1.887c.891-.402 1.79.502 1.49 1.502l-1.677 5.59c-.192.638-.851 1.018-1.49.764l-4.24-1.402c-.769-.256-.922-1.27-.265-1.749l1.996-2.819v.001z" />
          </svg>
        ),
      };
    default:
      return {
        name: platform,
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: null,
      };
  }
};

// Removed useToast import as it cannot be found
// Improve the section header component
const SectionHeader = ({
  icon,
  title,
  description = null,
  action = null,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode | null;
  action?: React.ReactNode | null;
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
    <div className="flex items-center">
      <div className="mr-3 p-2 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const ReviewsPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;

  // State for data and loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);

  // Filter state
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'read' | 'unread' | 'important' | 'replied' | 'not-replied'
  >('all');
  const [filterPlatform, setFilterPlatform] = useState<MarketPlatform | 'all'>(
    'all'
  );
  const [filterDateRange, setFilterDateRange] = useState<
    'all' | '30days' | '90days' | '365days'
  >('all');

  // Sort state
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<20 | 30 | 50>(20);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Add state for advanced filters
  const [advancedFilters, setAdvancedFilters] = useState<{
    searchTerm: string;
    keywordFilter: string[];
    minSentiment: number | null;
    maxSentiment: number | null;
    hasPhotos: boolean | null;
  }>({
    searchTerm: '',
    keywordFilter: [],
    minSentiment: null,
    maxSentiment: null,
    hasPhotos: null,
  });

  // Add state for AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<{
    loading: boolean;
    suggestions: Array<{
      id: string;
      reason: string;
    }>;
  }>({
    loading: false,
    suggestions: [],
  });

  const { toast } = useToast();

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.searchTerm) count++;
    if (advancedFilters.keywordFilter.length > 0) count++;
    if (
      advancedFilters.minSentiment !== null ||
      advancedFilters.maxSentiment !== null
    )
      count++;
    if (advancedFilters.hasPhotos !== null) count++;
    return count;
  }, [advancedFilters]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reviews?teamSlug=${slug}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setReviewsData(data.reviews);
      } catch (err: any) {
        console.error('Error fetching reviews data:', err);
        setError(err.message || 'An error occurred while fetching reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [slug]);

  // Function to update review status
  const updateReviewStatus = async (
    reviewId: string,
    field: 'isRead' | 'isImportant' | 'reply',
    value: boolean | string
  ) => {
    try {
      // Optimistically update the UI first
      setReviewsData((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId 
            ? { ...review, [field]: value }
            : review
        )
      );

      const response = await fetch(
        `/api/reviews/${reviewId}/update-review-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        // Revert the optimistic update on error
        setReviewsData((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId 
              ? { ...review, [field]: !value }
              : review
          )
        );
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Show success message without affecting scroll
      const message = t(`${field}-updated-successfully`);
      toast({
        title: message,
        duration: 2000,
      });
    } catch (err: any) {
      console.error('Error updating review status:', err);
      // Show error message without affecting scroll
      toast({
        title: t(`error-updating-${field}`),
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Get the most recent scrape date from reviews
  const latestReviewDate = useMemo(() => {
    if (reviewsData.length === 0) return null;

    const dates = reviewsData
      .filter((r) => r.scrapedAt != null)
      .map((r) => new Date(r.scrapedAt!));

    return dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : null;
  }, [reviewsData]);

  // Function to sync reviews from external sources
  const syncReviews = async () => {
    if (!slug) return;

    setIsSyncing(true);

    try {
      const response = await fetch('/api/sync-google-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamSlug: slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to sync reviews');
      }

      // If we have fresh data, update our reviews
      if (data.freshData) {
        setReviewsData((prev) => [
          ...prev,
          ...data.reviews.filter(
            (r: Review) =>
              !prev.some((existingReview) => existingReview.id === r.id)
          ),
        ]);
      }

      setUpdateStatus({
        message: data.message || 'Successfully synced reviews',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error syncing reviews:', error);
      setUpdateStatus({
        message: error.message || 'An error occurred during sync',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);

      // Clear status messages after 5 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 5000);
    }
  };

  // Enhance the filtering logic to incorporate advanced filters
  const filteredReviews = useMemo(() => {
    let filtered = [...reviewsData];

    // Apply basic filters (existing code)
    if (filterRating !== null) {
      filtered = filtered.filter(
        (review) => Math.round(review.rating) === filterRating
      );
    }

    // Apply status filters
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'read':
          filtered = filtered.filter((review) => review.isRead);
          break;
        case 'unread':
          filtered = filtered.filter((review) => !review.isRead);
          break;
        case 'important':
          filtered = filtered.filter((review) => review.isImportant);
          break;
        case 'replied':
          filtered = filtered.filter(
            (review) => review.reply !== null && review.reply !== ''
          );
          break;
        case 'not-replied':
          filtered = filtered.filter(
            (review) => review.reply === null || review.reply === ''
          );
          break;
      }
    }

    // Apply platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter((review) => review.source === filterPlatform);
    }

    // Apply date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const fromDate = new Date();

      switch (filterDateRange) {
        case '30days':
          fromDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          fromDate.setDate(now.getDate() - 90);
          break;
        case '365days':
          fromDate.setDate(now.getDate() - 365);
          break;
      }

      filtered = filtered.filter((review) => {
        const reviewDate = new Date(review.date);
        return reviewDate >= fromDate;
      });
    }

    // Apply advanced filters
    if (advancedFilters.searchTerm) {
      const searchTermLower = advancedFilters.searchTerm.toLowerCase();
      filtered = filtered.filter((review) => {
        const textMatch = review.text?.toLowerCase().includes(searchTermLower);
        const authorMatch = review.author
          ?.toLowerCase()
          .includes(searchTermLower);
        return textMatch || authorMatch;
      });
    }

    if (advancedFilters.keywordFilter.length > 0) {
      filtered = filtered.filter((review) => {
        if (!review.keywords) return false;

        const reviewKeywords =
          typeof review.keywords === 'string'
            ? JSON.parse(review.keywords)
            : review.keywords;

        if (!Array.isArray(reviewKeywords)) return false;

        return advancedFilters.keywordFilter.some((keyword) =>
          reviewKeywords.includes(keyword)
        );
      });
    }

    if (advancedFilters.minSentiment !== null) {
      filtered = filtered.filter(
        (review) =>
          review.sentiment !== null &&
          review.sentiment >= advancedFilters.minSentiment!
      );
    }

    if (advancedFilters.maxSentiment !== null) {
      filtered = filtered.filter(
        (review) =>
          review.sentiment !== null &&
          review.sentiment <= advancedFilters.maxSentiment!
      );
    }

    if (advancedFilters.hasPhotos !== null) {
      filtered = filtered.filter((review) => {
        if (advancedFilters.hasPhotos === true) {
          return review.photoCount > 0;
        } else {
          return review.photoCount === 0;
        }
      });
    }

    return filtered;
  }, [
    reviewsData,
    filterRating,
    filterStatus,
    filterPlatform,
    filterDateRange,
    advancedFilters,
  ]);

  // Apply sorting
  const {
    totalReviews,
    totalAvgRating,
    replyRate,
    totalPages,
    paginatedReviews,
  } = useMemo(() => {
    // Calculate pagination
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReviews = filteredReviews.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    // Calculate statistics
    const totalReviews = reviewsData.length;

    const totalAvgRating =
      reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0;

    const replyRate =
      reviewsData.length > 0
        ? (reviewsData.filter((r) => r.reply).length / reviewsData.length) * 100
        : 0;

    return {
      totalReviews,
      totalAvgRating,
      replyRate,
      totalPages,
      paginatedReviews,
    };
  }, [filteredReviews, itemsPerPage, currentPage]);

  // Helper components and functions
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );

  // Function to get sentiment class based on rating
  const getSentimentClass = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 border-green-300';
    if (rating === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Update the LastSyncInfo component
  const LastSyncInfo = () => (
    <div className="p-6 flex justify-between items-center border-b border-border bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <svg
            className="h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-medium">
            {latestReviewDate ? (
              <span>
                {t('last-synced')}: {format(latestReviewDate, 'PPP')}
              </span>
            ) : (
              <span>{t('never-synced')}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('sync-reviews-description')}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={syncReviews}
        disabled={isSyncing}
        className="gap-2"
      >
        {isSyncing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t('syncing')}
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            {t('sync-reviews')}
          </>
        )}
      </Button>
    </div>
  );

  // Memoize the FilterControls component
  const FilterControls = memo(() => {
    return (
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Rating filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              {filterRating !== null ? `${filterRating} ${t('stars')}` : t('all-ratings')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t('filter-by-rating')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilterRating(null)}>
                {t('all-ratings')}
              </DropdownMenuItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <DropdownMenuItem
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                >
                  {rating} {t('stars')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              {filterStatus === 'all' ? t('all') : t(filterStatus)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t('filter-by-status')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {['all', 'read', 'unread', 'important', 'replied', 'not-replied'].map(
                (status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                  >
                    {t(status)}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Platform filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              {filterPlatform === 'all' ? t('all') : t(filterPlatform)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t('filter-by-platform')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilterPlatform('all')}>
                {t('all')}
              </DropdownMenuItem>
              {Object.values(MarketPlatform).map((platform) => (
                <DropdownMenuItem
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                >
                  {t(platform)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {filterDateRange === 'all' ? t('all') : t(filterDateRange)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t('filter-by-date')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {['all', '30days', '90days', '365days'].map((range) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => setFilterDateRange(range as any)}
                >
                  {t(range)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  });

  FilterControls.displayName = 'FilterControls';

  // Stats cards
  const ReviewStats = () => {
    // Calculate most common keywords across all reviews
    const keywordCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      reviewsData.forEach((review) => {
        if (review.keywords) {
          let keywords: string[] = [];
          try {
            if (typeof review.keywords === 'string') {
              keywords = JSON.parse(review.keywords) as string[];
            } else if (Array.isArray(review.keywords)) {
              keywords = review.keywords;
            }

            if (Array.isArray(keywords)) {
              keywords.forEach((keyword) => {
                counts[keyword] = (counts[keyword] || 0) + 1;
              });
            }
          } catch (err) {
            console.error('Error processing keywords:', err);
          }
        }
      });

      // Sort by count and take top 5
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    }, [reviewsData]);

    // Calculate sentiment distribution
    const sentimentData = useMemo(() => {
      const positive = reviewsData.filter(
        (r) => r.sentiment && r.sentiment > 0.33
      ).length;
      const neutral = reviewsData.filter(
        (r) => r.sentiment && r.sentiment >= -0.33 && r.sentiment <= 0.33
      ).length;
      const negative = reviewsData.filter(
        (r) => r.sentiment && r.sentiment < -0.33
      ).length;

      const total = positive + neutral + negative || 1; // Avoid division by zero

      return {
        positive: {
          count: positive,
          percentage: (positive / total) * 100,
        },
        neutral: {
          count: neutral,
          percentage: (neutral / total) * 100,
        },
        negative: {
          count: negative,
          percentage: (negative / total) * 100,
        },
      };
    }, [reviewsData]);

    return (
      <div className="p-6 border-b border-border bg-card">
        <SectionHeader
          icon={<ChartBarIcon className="h-5 w-5" />}
          title={t('review-statistics')}
          description={t('overall-performance-metrics')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('average-rating')}
                  </CardTitle>
                  <InfoButton
                    content={
                      <div className="space-y-2">
                        <p className="text-sm">
                          {t('average-rating-explanation')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('average-rating-suggestion')}
                        </p>
                      </div>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-bold mr-2">
                    {totalAvgRating.toFixed(1)}
                  </span>
                  <StarRating rating={totalAvgRating} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('from-reviews', { count: totalReviews })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('response-rate')}
                  </CardTitle>
                  <InfoButton
                    content={
                      <div className="space-y-2">
                        <p className="text-sm">
                          {t('response-rate-explanation')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('response-rate-suggestion')}
                        </p>
                      </div>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold">
                  {Math.round(replyRate)}%
                </span>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('of-reviews-replied')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Analysis Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('sentiment-analysis')}
                </CardTitle>
                <InfoButton
                  content={
                    <div className="space-y-2">
                      <p className="text-sm">
                        {t('sentiment-analysis-explanation')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('sentiment-analysis-suggestion')}
                      </p>
                    </div>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                      {t('positive')}
                    </span>
                    <span className="text-sm font-medium">
                      {`${Math.round(sentimentData.positive.percentage)}% (${sentimentData.positive.count})`}
                    </span>
                  </div>
                  <Progress
                    className="bg-muted h-2"
                    value={sentimentData.positive.percentage}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                      {t('neutral')}
                    </span>
                    <span className="text-sm font-medium">
                      {`${Math.round(sentimentData.neutral.percentage)}% (${sentimentData.neutral.count})`}
                    </span>
                  </div>
                  <Progress
                    className="bg-muted h-2"
                    value={sentimentData.neutral.percentage}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                      {t('negative')}
                    </span>
                    <span className="text-sm font-medium">
                      {`${Math.round(sentimentData.negative.percentage)}% (${sentimentData.negative.count})`}
                    </span>
                  </div>
                  <Progress
                    className="bg-muted h-2"
                    value={sentimentData.negative.percentage}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Analysis Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('popular-keywords')}
                </CardTitle>
                <InfoButton
                  content={
                    <div className="space-y-2">
                      <p className="text-sm">
                        {t('popular-keywords-explanation')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('popular-keywords-suggestion')}
                      </p>
                    </div>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {keywordCounts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywordCounts.map(([keyword, count]) => (
                    <div
                      key={keyword}
                      className="bg-secondary/30 rounded-full px-3 py-1 text-sm"
                    >
                      {keyword} <span className="font-medium">({count})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('no-keywords-found')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Pagination controls
  const PaginationControls = () => (
    <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <select
          value={itemsPerPage}
          onChange={(e) =>
            setItemsPerPage(Number(e.target.value) as 20 | 30 | 50)
          }
          className="p-2 text-sm rounded-md border border-border"
        >
          <option value={20}>20 {t('per-page')}</option>
          <option value={30}>30 {t('per-page')}</option>
          <option value={50}>50 {t('per-page')}</option>
        </select>
        <span className="text-sm text-muted-foreground">
          {t('showing')} {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredReviews.length)}{' '}
          {t('of')} {filteredReviews.length}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          {t('first')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t('previous')}
        </Button>
        <span className="flex items-center px-3 text-sm">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {t('next')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          {t('last')}
        </Button>
      </div>
    </div>
  );

  // Memoize the ReviewItem component
  const ReviewItem = memo(({ review }: { review: Review }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleRead = useCallback(() => {
      updateReviewStatus(review.id, 'isRead', !review.isRead);
    }, [review.id, review.isRead]);

    const handleToggleImportant = useCallback(() => {
      updateReviewStatus(review.id, 'isImportant', !review.isImportant);
    }, [review.id, review.isImportant]);

    // Memoize the avatar URL
    const avatarUrl = useMemo(() => {
      if (review.authorImage) return review.authorImage;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author || 'Anonymous')}&background=random`;
    }, [review.authorImage, review.author]);

    // Memoize platform details
    const platformDetails = useMemo(() => getPlatformDetails(review.source), [review.source]);

    // Memoize keywords
    const keywords = useMemo(() => {
      if (!review.keywords) return [];
      try {
        if (typeof review.keywords === 'string') {
          try {
            return JSON.parse(review.keywords);
          } catch {
            return [];
          }
        }
        return Array.isArray(review.keywords) ? review.keywords : [];
      } catch (err) {
        console.error('Error parsing keywords:', err);
        return [];
      }
    }, [review.keywords]);

    // Memoize sentiment color class
    const sentimentColorClass = useMemo(() => {
      if (!review.sentiment) return 'text-gray-500';
      if (review.sentiment > 0.33) return 'text-green-500';
      if (review.sentiment >= -0.33 && review.sentiment <= 0.33) return 'text-yellow-500';
      return 'text-red-500';
    }, [review.sentiment]);

    // Memoize sentiment score
    const sentimentScore = useMemo(() => {
      if (review.sentiment === null) return 'N/A';
      const percentage = Math.abs(review.sentiment * 100).toFixed(0);
      if (review.sentiment > 0.33) return `+${percentage}%`;
      if (review.sentiment < -0.33) return `-${percentage}%`;
      return `${percentage}%`;
    }, [review.sentiment]);

    return (
      <div
        className={`p-4 ${!review.isRead ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''} ${review.isImportant ? 'border-l-2 border-l-yellow-400' : ''}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Review Header with Author Info */}
          <div className="md:w-64 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-background">
                <img
                  src={avatarUrl}
                  alt={review.author || 'Anonymous'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author || 'Anonymous')}&background=random`;
                  }}
                />
              </div>
              <div>
                <div className="font-medium">
                  {review.author || t('anonymous')}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(new Date(review.date), 'MMM d, yyyy')}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${platformDetails.color}`}
                  >
                    {platformDetails.icon && <span className="mr-1">{platformDetails.icon}</span>}
                    {platformDetails.name}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSentimentClass(review.rating)}`}
                  >
                    {review.rating >= 4
                      ? t('positive')
                      : review.rating === 3
                        ? t('neutral')
                        : t('negative')}
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center text-sm ${sentimentColorClass}`}
                  >
                    {t('sentiment')}: {sentimentScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div
              className={`${isExpanded ? '' : 'line-clamp-3'} text-gray-700 bg-muted/30 p-3 rounded-md dark:bg-muted/10`}
            >
              {review.text || t('no-review-text')}
            </div>

            {review.text && review.text.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? t('show-less') : t('show-more')}
              </Button>
            )}

            {/* Review Keywords */}
            {keywords.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-muted-foreground mb-1">
                  {t('keywords')}:
                </div>
                <div className="flex flex-wrap gap-1">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleRead}
                className="flex items-center gap-1"
              >
                <EyeIcon className="h-3 w-3" />
                {review.isRead ? t('mark-as-unread') : t('mark-as-read')}
              </Button>

              <Button
                variant={review.isImportant ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleImportant}
                className="flex items-center gap-1"
              >
                <BookmarkIcon className="h-3 w-3" />
                {review.isImportant
                  ? t('remove-important')
                  : t('mark-as-important')}
              </Button>

              <Link href={review.sourceUrl ?? "#"} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  {review.reply ? t('edit-reply') : t('reply')}
                </Button>
              </Link>
            </div>

            {/* Review Reply */}
            {review.reply && (
              <div className="mt-3 p-3 bg-primary/5 rounded-md">
                <div className="text-sm font-medium mb-1 flex items-center">
                  <span className="mr-2">{t('your-reply')}:</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="text-sm">{review.reply}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  ReviewItem.displayName = 'ReviewItem';

  // Add these loading component implementations
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );

  const ReviewItemSkeleton = () => (
    <div className="p-4 border-b border-border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64 flex-shrink-0">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-1 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );

  // Add a function to export reviews to CSV
  const exportReviewsToCSV = () => {
    // Create CSV headers
    const headers = [
      'Author',
      'Date',
      'Rating',
      'Platform',
      'Text',
      'Reply',
      'Sentiment',
      'Keywords',
    ].join(',');

    // Convert reviews to CSV rows
    const csvRows = reviewsData.map((review) => {
      // Format keywords - handle the case where keywords might be stored differently in Prisma model
      let keywordsStr = '';

      // Check if keywords exist and handle different possible formats
      if (review.keywords !== undefined) {
        try {
          if (typeof review.keywords === 'string') {
            // If keywords is a string (possibly JSON), use it directly or parse it
            try {
              // Try to parse it as JSON first
              const parsedKeywords = JSON.parse(review.keywords);
              if (Array.isArray(parsedKeywords)) {
                keywordsStr = JSON.stringify(parsedKeywords).replace(
                  /"/g,
                  '""'
                );
              } else {
                const keywords = review.keywords as string[]
                keywordsStr = keywords.map(keyword => keyword.replace(/"/g, '""')) // Apply replace to each string
                .join(','); // Join the array back into a single string, if needed
              
              }
            } catch {
              const keywords = review.keywords as string[]
              keywordsStr = keywords.map(keyword => keyword.replace(/"/g, '""')) // Apply replace to each string
              .join(','); // Join the array back into a single string, if needed
            }
          } else if (Array.isArray(review.keywords)) {
            // If keywords is already an array
            keywordsStr = JSON.stringify(review.keywords).replace(/"/g, '""');
          }
        } catch (err) {
          console.error('Error formatting keywords:', err);
        }
      }

      // Format cells with proper escaping
      const row = [
        `"${review.author || 'Anonymous'}"`,
        `"${format(new Date(review.date), 'yyyy-MM-dd')}"`,
        review.rating,
        `"${review.source}"`,
        `"${(review.text || '').replace(/"/g, '""')}"`,
        `"${(review.reply || '').replace(/"/g, '""')}"`,
        review.sentiment || 'N/A',
        `"${keywordsStr}"`,
      ];

      return row.join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `reviews-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this new component for market provider stats
  const MarketProviderStats = () => {
    // Additional platforms that might be implemented in the future
    const allPlatforms = [
      MarketPlatform.GOOGLE_MAPS,
      MarketPlatform.FACEBOOK,
      MarketPlatform.YELP,
      'TRIPADVISOR',
      'TRUSTPILOT',
      'BOOKING',
      'EXPEDIA',
      'AIRBNB',
      'APPLE_STORE',
      'GOOGLE_PLAY',
    ];

    // Calculate distribution by platform
    const platformStats = useMemo(() => {
      const stats: Record<
        string,
        { count: number; avgRating: number; implemented: boolean }
      > = {};

      // Initialize stats for all platforms
      allPlatforms.forEach((platform) => {
        // Default state for all platforms
        stats[platform] = { count: 0, avgRating: 0, implemented: false };

        // Mark existing platforms as implemented
        if (
          Object.values(MarketPlatform).includes(platform as MarketPlatform)
        ) {
          stats[platform].implemented = true;
        }
      });

      // Count reviews per platform
      reviewsData.forEach((review) => {
        if (stats[review.source]) {
          stats[review.source].count += 1;
          stats[review.source].avgRating += review.rating;
        }
      });

      // Calculate average ratings
      Object.keys(stats).forEach((platform) => {
        if (stats[platform].count > 0) {
          stats[platform].avgRating =
            stats[platform].avgRating / stats[platform].count;
        }
      });

      return Object.entries(stats).sort((a, b) => {
        // First sort by implementation status
        if (a[1].implemented !== b[1].implemented) {
          return a[1].implemented ? -1 : 1;
        }
        // Then by count
        return b[1].count - a[1].count;
      });
    }, [reviewsData, allPlatforms]);

    // Get the total number of reviews
    const totalReviews = useMemo(
      () => platformStats.reduce((sum, [, data]) => sum + data.count, 0),
      [platformStats]
    );

    // Get the platform-specific details like name and color
    const getPlatformDetails = (platform: string) => {
      switch (platform) {
        case MarketPlatform.GOOGLE_MAPS:
          return {
            name: 'Google',
            color: 'bg-blue-100 text-blue-800 border-blue-300',
            icon: (
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </svg>
            ),
          };
        case MarketPlatform.FACEBOOK:
          return {
            name: 'Facebook',
            color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            icon: (
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            ),
          };
        case MarketPlatform.YELP:
          return {
            name: 'Yelp',
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: (
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.16 12.594l-4.995 1.452c-.94.272-1.776-.513-1.484-1.411l1.374-4.233c.28-.868 1.474-1.012 2.105-.254 1.15 1.385 3 4.596 3 4.596.192.293.192.65 0 .942v-1.092zm-5.387 2.288l4.643 2.336c.771.39.74 1.512-.052 1.85l-3.783 1.614c-.83.354-1.77-.318-1.663-1.19l.505-4.035c.106-.85 1.19-1.004 1.728-.446.038-.89.622-.219.622-.129zm-1.956-8.87c-.407-.788.182-1.768 1.042-1.737l4.067.15c.86.03 1.285 1.008.756 1.731l-2.508 3.433c-.528.724-1.628.445-1.943-.493L12.817 6.01v.002zm-3.007 1.837c.433-.778 1.582-.662 1.99.202l1.979 4.194c.41.863-.356 1.781-1.298 1.55l-4.471-1.089c-.941-.23-1.12-1.489-.319-2.24l2.119-2.617zm-3.187 7.727l4.186-1.887c.891-.402 1.79.502 1.49 1.502l-1.677 5.59c-.192.638-.851 1.018-1.49.764l-4.24-1.402c-.769-.256-.922-1.27-.265-1.749l1.996-2.819v.001z" />
              </svg>
            ),
          };
        default:
          return {
            name: platform,
            color: 'bg-gray-100 text-gray-800 border-gray-300',
            icon: null,
          };
      }
    };

    if (platformStats.length === 0) {
      return null;
    }

    return (
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium text-lg">
              {t('platform-distribution')}
            </h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('total-reviews-count', { count: totalReviews })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map(([platform, data]) => {
            const { name, color, icon } = getPlatformDetails(platform);
            const percentage =
              totalReviews > 0
                ? Math.round((data.count / totalReviews) * 100)
                : 0;

            return (
              <Card
                key={platform}
                className={`${!data.implemented ? 'opacity-50' : ''} ${data.count > 0 ? '' : 'border-dashed'}`}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
                    >
                      {icon && <span className="mr-1">{icon}</span>}
                      {name}
                    </div>
                    {!data.implemented && (
                      <Badge variant="outline" className="text-xs">
                        {t('coming-soon')}
                      </Badge>
                    )}
                  </div>
                  {data.count > 0 && (
                    <div className="flex items-center">
                      <StarIcon
                        className="h-4 w-4 text-yellow-400 mr-1"
                        fill="currentColor"
                      />
                      <span className="text-sm font-medium">
                        {data.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t('reviews-count')}
                      </span>
                      <span className="text-lg font-bold">{data.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t('percentage')}
                      </span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-2 ${data.count > 0 ? '' : 'bg-muted/50'}`}
                    />
                    {!data.implemented && data.count === 0 && (
                      <div className="text-xs text-center text-muted-foreground mt-2">
                        {t('integration-pending')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // First, enhance the ReviewAnalytics component with improved logic
  const ReviewAnalytics = () => {
    // Calculate monthly review distribution
    const monthlyDistribution = useMemo(() => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);

      // Create a map of the last 6 months
      const months: Record<
        string,
        { count: number; avgRating: number; ratings: number[] }
      > = {};

      // Initialize the months
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthKey = format(date, 'MMM yyyy');
        months[monthKey] = { count: 0, avgRating: 0, ratings: [] };
      }

      // Count reviews per month
      reviewsData.forEach((review) => {
        const reviewDate = new Date(review.date);
        // Only consider reviews in the last 6 months
        if (reviewDate >= sixMonthsAgo) {
          const monthKey = format(reviewDate, 'MMM yyyy');
          if (months[monthKey]) {
            months[monthKey].count += 1;
            months[monthKey].ratings.push(review.rating);
          }
        }
      });

      // Calculate average ratings
      Object.keys(months).forEach((month) => {
        if (months[month].ratings.length > 0) {
          months[month].avgRating =
            months[month].ratings.reduce((sum, r) => sum + r, 0) /
            months[month].ratings.length;
        }
      });

      // Convert to array for rendering
      return Object.entries(months)
        .map(([month, data]) => ({ month, ...data }))
        .reverse();
    }, [reviewsData]);

    // Calculate review trends by comparing periods
    const reviewTrends = useMemo(() => {
      // Compare current month to previous month
      const currentMonthDate = new Date();
      const previousMonthDate = new Date();
      previousMonthDate.setMonth(currentMonthDate.getMonth() - 1);

      const currentMonth = format(currentMonthDate, 'MMM yyyy');
      const previousMonth = format(previousMonthDate, 'MMM yyyy');

      // Count reviews and calculate average ratings
      let currentMonthCount = 0;
      let previousMonthCount = 0;
      let currentAvgRating = 0;
      let previousAvgRating = 0;

      const currentMonthRatings: number[] = [];
      const previousMonthRatings: number[] = [];

      reviewsData.forEach((review) => {
        const reviewDate = new Date(review.date);
        const reviewMonth = format(reviewDate, 'MMM yyyy');

        if (reviewMonth === currentMonth) {
          currentMonthCount++;
          currentMonthRatings.push(review.rating);
        } else if (reviewMonth === previousMonth) {
          previousMonthCount++;
          previousMonthRatings.push(review.rating);
        }
      });

      // Calculate average ratings
      if (currentMonthRatings.length > 0) {
        currentAvgRating =
          currentMonthRatings.reduce((sum, r) => sum + r, 0) /
          currentMonthRatings.length;
      }

      if (previousMonthRatings.length > 0) {
        previousAvgRating =
          previousMonthRatings.reduce((sum, r) => sum + r, 0) /
          previousMonthRatings.length;
      }

      // Calculate response times
      const currentMonthReplied = reviewsData.filter(
        (r) => r.reply && format(new Date(r.date), 'MMM yyyy') === currentMonth
      );

      const previousMonthReplied = reviewsData.filter(
        (r) => r.reply && format(new Date(r.date), 'MMM yyyy') === previousMonth
      );

      // Calculate average response time for each month
      let currentResponseTime = 0;
      let previousResponseTime = 0;

      if (currentMonthReplied.length > 0) {
        currentResponseTime =
          currentMonthReplied.reduce((sum, r) => {
            const reviewDate = new Date(r.date).getTime();
            const replyDate = new Date(r.updatedAt).getTime();
            return sum + (replyDate - reviewDate);
          }, 0) / currentMonthReplied.length;
      }

      if (previousMonthReplied.length > 0) {
        previousResponseTime =
          previousMonthReplied.reduce((sum, r) => {
            const reviewDate = new Date(r.date).getTime();
            const replyDate = new Date(r.updatedAt).getTime();
            return sum + (replyDate - reviewDate);
          }, 0) / previousMonthReplied.length;
      }

      // Convert to days
      currentResponseTime = currentResponseTime / (1000 * 60 * 60 * 24);
      previousResponseTime = previousResponseTime / (1000 * 60 * 60 * 24);

      // Calculate % changes
      const countChange =
        previousMonthCount === 0
          ? 100 // If no reviews last month, show 100% increase
          : ((currentMonthCount - previousMonthCount) / previousMonthCount) *
            100;

      const ratingChange =
        previousAvgRating === 0
          ? 0
          : ((currentAvgRating - previousAvgRating) / previousAvgRating) * 100;

      const responseTimeChange =
        previousResponseTime === 0
          ? 0
          : ((previousResponseTime - currentResponseTime) /
              previousResponseTime) *
            100;

      return {
        currentMonth,
        previousMonth,
        reviewCount: {
          current: currentMonthCount,
          previous: previousMonthCount,
          percentChange: countChange,
        },
        avgRating: {
          current: currentAvgRating,
          previous: previousAvgRating,
          percentChange: ratingChange,
        },
        responseTime: {
          current: currentResponseTime,
          previous: previousResponseTime,
          percentChange: responseTimeChange,
        },
      };
    }, [reviewsData]);

    // Calculate rating distribution
    const ratingDistribution = useMemo(() => {
      const distribution = [0, 0, 0, 0, 0]; // 5 positions for 1-5 stars

      reviewsData.forEach((review) => {
        const ratingIndex = Math.floor(review.rating) - 1;
        if (ratingIndex >= 0 && ratingIndex < 5) {
          distribution[ratingIndex]++;
        }
      });

      const total = distribution.reduce((sum, count) => sum + count, 0);

      return {
        counts: distribution,
        percentages: distribution.map((count) =>
          total > 0 ? (count / total) * 100 : 0
        ),
      };
    }, [reviewsData]);

    if (reviewsData.length === 0) {
      return null;
    }

    return (
      <div className="p-6 border-b border-border bg-card">
        <SectionHeader
          icon={<ChartBarIcon className="h-5 w-5" />}
          title={t('reviews-analytics')}
          description={t('review-trends-and-patterns')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('monthly-distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <div className="grid grid-cols-6 h-full gap-2 items-end">
                  {monthlyDistribution.map(({ month, count, avgRating }) => (
                    <div key={month} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {count > 0 && avgRating > 0 && (
                          <div className="flex items-center">
                            <StarIcon
                              className="h-3 w-3 text-yellow-400"
                              fill="currentColor"
                            />
                            <span className="ml-0.5">
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`w-full rounded-t flex justify-center items-end ${count > 0 ? 'bg-primary/80' : 'bg-muted'}`}
                        style={{
                          height: `${Math.max(5, Math.min(100, (count / 10) * 100))}%`,
                          minHeight: count > 0 ? '20px' : '5px',
                        }}
                      >
                        {count > 0 && (
                          <span className="text-xs text-primary-foreground font-medium -mt-5">
                            {count}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                        {month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('rating-distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating, i) => (
                  <div key={rating}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm mr-2">{rating}</span>
                        <div className="flex">
                          {[...Array(rating)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className="h-3 w-3 text-yellow-400"
                              fill="currentColor"
                            />
                          ))}
                          {[...Array(5 - rating)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className="h-3 w-3 text-gray-300"
                              fill="none"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {ratingDistribution.counts[4 - i]} (
                        {Math.round(ratingDistribution.percentages[4 - i])}%)
                      </div>
                    </div>
                    <Progress
                      value={ratingDistribution.percentages[4 - i]}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly trends section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
            {/* Review volume trend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {t('review-volume')}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      reviewTrends.reviewCount.percentChange > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {reviewTrends.reviewCount.percentChange > 0 ? '+' : ''}
                    {Math.round(reviewTrends.reviewCount.percentChange)}%
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {reviewTrends.reviewCount.current}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('versus')} {reviewTrends.reviewCount.previous}{' '}
                  {t('last-period')}
                </div>
                <div className="flex items-center mt-3">
                  {reviewTrends.reviewCount.percentChange > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm">
                    {reviewTrends.reviewCount.percentChange > 0
                      ? t('more-reviews-than-last-month')
                      : t('fewer-reviews-than-last-month')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rating trend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {t('average-rating')}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      reviewTrends.avgRating.percentChange >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {reviewTrends.avgRating.percentChange >= 0 ? '+' : ''}
                    {Math.round(reviewTrends.avgRating.percentChange * 10) / 10}
                    %
                  </div>
                </div>
                <div className="text-2xl font-bold flex items-center">
                  {reviewTrends.avgRating.current.toFixed(1)}
                  <StarIcon
                    className="h-5 w-5 text-yellow-400 ml-1"
                    fill="currentColor"
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('versus')} {reviewTrends.avgRating.previous.toFixed(1)}{' '}
                  {t('last-period')}
                </div>
                <div className="flex items-center mt-3">
                  {reviewTrends.avgRating.percentChange >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm">
                    {reviewTrends.avgRating.percentChange >= 0
                      ? t('rating-improved')
                      : t('rating-decreased')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Response time trend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {t('response-time')}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      reviewTrends.responseTime.percentChange > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {reviewTrends.responseTime.percentChange > 0 ? '+' : ''}
                    {Math.round(reviewTrends.responseTime.percentChange)}%
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(reviewTrends.responseTime.current)} {t('days')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('versus')} {Math.round(reviewTrends.responseTime.previous)}{' '}
                  {t('days')} {t('last-period')}
                </div>
                <div className="flex items-center mt-3">
                  {reviewTrends.responseTime.percentChange > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm">
                    {reviewTrends.responseTime.percentChange > 0
                      ? t('faster-responses')
                      : t('slower-responses')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Function to get AI review suggestions
  const getAiSuggestions = async () => {
    setAiSuggestions((prev) => ({ ...prev, loading: true }));

    try {
      // Check if slug exists before making the API call
      if (!slug) {
        throw new Error('Team slug is not defined');
      }

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `/api/reviews/ai-suggestions?teamSlug=${slug}`,
        {
          signal: controller.signal,
        }
      ).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Verify that the data has the expected structure
      if (!data || !Array.isArray(data.suggestions)) {
        console.warn(
          'AI suggestions API returned unexpected data structure:',
          data
        );
        setAiSuggestions({
          loading: false,
          suggestions: [],
        });
        return;
      }

      setAiSuggestions({
        loading: false,
        suggestions: data.suggestions,
      });
    } catch (error: any) {
      console.error('Error fetching AI suggestions:', error);

      // Show a more user-friendly error in the console
      if (error.name === 'AbortError') {
        console.warn('AI suggestions request timed out');
      }

      // Reset the state to not loading, with empty suggestions
      setAiSuggestions({
        loading: false,
        suggestions: [],
      });
    }
  };

  // Add an Advanced Filters component
  const AdvancedFiltersMenu = () => {
    // Get example keywords for filtering from the reviews
    const topKeywords = useMemo(() => {
      const allKeywords: string[] = [];
      reviewsData.forEach((review) => {
        if (review.keywords) {
          try {
            let keywords: string[] = [];
            if (typeof review.keywords === 'string') {
              keywords = JSON.parse(review.keywords) as string[];
            } else if (Array.isArray(review.keywords)) {
              keywords = review.keywords;
            }

            if (Array.isArray(keywords)) {
              allKeywords.push(...keywords);
            }
          } catch (err) {
            console.error('Error parsing keywords for filter:', err);
          }
        }
      });

      // Count occurrences and get top keywords
      const counts: Record<string, number> = {};
      allKeywords.forEach((keyword) => {
        counts[keyword] = (counts[keyword] || 0) + 1;
      });

      return Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .slice(0, 5);
    }, [reviewsData]);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            {t('advanced-filters')}
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">{t('advanced-filters')}</h4>

            <div className="space-y-2">
              <Label htmlFor="search-term">{t('search-review-text')}</Label>
              <Input
                id="search-term"
                placeholder={t('search-placeholder')}
                value={advancedFilters.searchTerm}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t('filter-by-keywords')}</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {topKeywords.map((keyword) => (
                  <div key={keyword} className="flex items-center space-x-2">
                    <Checkbox
                      id={`keyword-${keyword}`}
                      checked={advancedFilters.keywordFilter.includes(keyword)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            keywordFilter: [...prev.keywordFilter, keyword],
                          }));
                        } else {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            keywordFilter: prev.keywordFilter.filter(
                              (k) => k !== keyword
                            ),
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`keyword-${keyword}`}
                      className="text-sm cursor-pointer"
                    >
                      {keyword}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('sentiment-range')}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="-1"
                    max="1"
                    step="0.1"
                    placeholder={t('min')}
                    value={
                      advancedFilters.minSentiment !== null
                        ? advancedFilters.minSentiment
                        : ''
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ''
                          ? null
                          : parseFloat(e.target.value);
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        minSentiment: val,
                      }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="-1"
                    max="1"
                    step="0.1"
                    placeholder={t('max')}
                    value={
                      advancedFilters.maxSentiment !== null
                        ? advancedFilters.maxSentiment
                        : ''
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ''
                          ? null
                          : parseFloat(e.target.value);
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        maxSentiment: val,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('has-photos')}</Label>
              <div className="flex gap-2">
                <Button
                  variant={
                    advancedFilters.hasPhotos === true ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      hasPhotos: prev.hasPhotos === true ? null : true,
                    }))
                  }
                >
                  {t('with-photos')}
                </Button>
                <Button
                  variant={
                    advancedFilters.hasPhotos === false ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      hasPhotos: prev.hasPhotos === false ? null : false,
                    }))
                  }
                >
                  {t('without-photos')}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAdvancedFilters({
                    searchTerm: '',
                    keywordFilter: [],
                    minSentiment: null,
                    maxSentiment: null,
                    hasPhotos: null,
                  })
                }
              >
                {t('reset')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Add an AI suggestions component
  const AiSuggestions = () => {
    useEffect(() => {
      // Load AI suggestions when component mounts
      if (
        reviewsData.length > 0 &&
        aiSuggestions.suggestions.length === 0 &&
        !aiSuggestions.loading
      ) {
        getAiSuggestions();
      }
    }, [reviewsData]);

    if (reviewsData.length === 0) {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SparklesIcon className="h-4 w-4 mr-2" />
            {t('ai-suggestions')}
            {aiSuggestions.loading && (
              <span className="ml-2 h-3 w-3 rounded-full bg-primary animate-pulse"></span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t('ai-review-suggestions')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {aiSuggestions.loading ? (
            <DropdownMenuItem disabled>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary animate-pulse"></span>
                {t('analyzing-reviews')}
              </span>
            </DropdownMenuItem>
          ) : aiSuggestions.suggestions.length === 0 ? (
            <DropdownMenuItem disabled>{t('no-suggestions')}</DropdownMenuItem>
          ) : (
            <DropdownMenuGroup>
              {aiSuggestions.suggestions.map((suggestion) => {
                // Skip if the suggestion ID doesn't match any existing review
                const review = reviewsData.find((r) => r.id === suggestion.id);
                if (!review) return null;

                return (
                  <DropdownMenuItem
                    key={suggestion.id}
                    onClick={() => {
                      try {
                        // Highlight this review by setting filters
                        const keywordMatch =
                          suggestion.reason.match(/keyword "(.+?)"/);
                        if (keywordMatch && keywordMatch[1]) {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            keywordFilter: [keywordMatch[1]],
                          }));
                        }

                        if (suggestion.reason.includes('sentiment')) {
                          if (review.sentiment && review.sentiment < 0) {
                            setAdvancedFilters((prev) => ({
                              ...prev,
                              maxSentiment: 0,
                            }));
                          } else if (review.sentiment && review.sentiment > 0) {
                            setAdvancedFilters((prev) => ({
                              ...prev,
                              minSentiment: 0,
                            }));
                          }
                        }
                      } catch (err) {
                        console.error('Error processing AI suggestion:', err);
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">
                        {review.author || t('anonymous')}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {suggestion.reason}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Add InfoButton component
  const InfoButton = ({ content }: { content: React.ReactNode }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          {content}
        </div>
      </PopoverContent>
    </Popover>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold">{t('reviews-dashboard')}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('reviews-dashboard-description')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdvancedFiltersMenu />
                <AiSuggestions />
                <Button
                  variant="default"
                  size="sm"
                  onClick={exportReviewsToCSV}
                  className="flex items-center gap-2"
                  disabled={isLoading || reviewsData.length === 0}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {t('export-csv')}
                </Button>
              </div>
            </div>
          </div>

          {/* Last Sync Info */}
          <LastSyncInfo />

          {/* Status Messages */}
          {updateStatus && (
            <div className="px-6 py-4 bg-card">
              <div
                className={`${
                  updateStatus.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                } border px-4 py-3 rounded-md flex items-start`}
              >
                <div className="mr-3">
                  {updateStatus.type === 'success' ? (
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-destructive"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>
                {updateStatus.message}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>

              <div className="p-4 border-t border-border">
                <Skeleton className="h-8 w-full max-w-lg mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              <div className="divide-y divide-border">
                <ReviewItemSkeleton />
                <ReviewItemSkeleton />
                <ReviewItemSkeleton />
              </div>
            </div>
          ) : (
            <>
              {/* Platform Distribution (First) */}
              {reviewsData.length > 0 && <MarketProviderStats />}

              {/* Review Statistics (Second) */}
              <ReviewStats />

              {/* Review Analytics (Third) */}
              {reviewsData.length > 0 && <ReviewAnalytics />}

              {/* Filter Controls */}
              <FilterControls />

              {/* Reviews List */}
              {paginatedReviews.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>{t('no-reviews-found')}</p>
                </div>
              ) : (
                <div className="p-6 border-t border-b border-border bg-card">
                  <SectionHeader
                    icon={<StarIcon className="h-5 w-5" />}
                    title={t('reviews')}
                    description={t('showing-reviews', {
                      from: (currentPage - 1) * itemsPerPage + 1,
                      to: Math.min(
                        currentPage * itemsPerPage,
                        filteredReviews.length
                      ),
                      total: filteredReviews.length,
                    })}
                    action={
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportReviewsToCSV}
                          className="flex items-center"
                          disabled={isLoading || reviewsData.length === 0}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          {t('export-csv')}
                        </Button>
                      </div>
                    }
                  />
                  <div className="mt-6 divide-y divide-border bg-background rounded-md">
                    {paginatedReviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 0 && <PaginationControls />}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">{t('reviews-dashboard')}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('reviews-dashboard-description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdvancedFiltersMenu />
              <AiSuggestions />
              <Button
                variant="default"
                size="sm"
                onClick={exportReviewsToCSV}
                className="flex items-center gap-2"
                disabled={isLoading || reviewsData.length === 0}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                {t('export-csv')}
              </Button>
            </div>
          </div>
        </div>

        {/* Last Sync Info */}
        <LastSyncInfo />

        {/* Status Messages */}
        {updateStatus && (
          <div className="px-6 py-4 bg-card">
            <div
              className={`${
                updateStatus.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              } border px-4 py-3 rounded-md flex items-start`}
            >
              <div className="mr-3">
                {updateStatus.type === 'success' ? (
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-destructive"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </div>
              {updateStatus.message}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>

            <div className="p-4 border-t border-border">
              <Skeleton className="h-8 w-full max-w-lg mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            <div className="divide-y divide-border">
              <ReviewItemSkeleton />
              <ReviewItemSkeleton />
              <ReviewItemSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* Platform Distribution (First) */}
            {reviewsData.length > 0 && <MarketProviderStats />}

            {/* Review Statistics (Second) */}
            <ReviewStats />

            {/* Review Analytics (Third) */}
            {reviewsData.length > 0 && <ReviewAnalytics />}

            {/* Filter Controls */}
            <FilterControls />

            {/* Reviews List */}
            {paginatedReviews.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>{t('no-reviews-found')}</p>
              </div>
            ) : (
              <div className="p-6 border-t border-b border-border bg-card">
                <SectionHeader
                  icon={<StarIcon className="h-5 w-5" />}
                  title={t('reviews')}
                  description={t('showing-reviews', {
                    from: (currentPage - 1) * itemsPerPage + 1,
                    to: Math.min(
                      currentPage * itemsPerPage,
                      filteredReviews.length
                    ),
                    total: filteredReviews.length,
                  })}
                  action={
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportReviewsToCSV}
                        className="flex items-center"
                        disabled={isLoading || reviewsData.length === 0}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {t('export-csv')}
                      </Button>
                    </div>
                  }
                />
                <div className="mt-6 divide-y divide-border bg-background rounded-md">
                  {paginatedReviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 0 && <PaginationControls />}
          </>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
  params,
}: {
  locale?: string;
  params?: { slug?: string };
}) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default ReviewsPage;

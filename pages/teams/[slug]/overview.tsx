import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Import Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Review, GoogleBusinessProfile, MarketPlatform } from '@prisma/client';

interface InfoButtonProps {
  content: React.ReactNode;
  className?: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ content, className }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className={cn("h-4 w-4 p-0", className)}>
        <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <div className="space-y-2">
        {content}
      </div>
    </PopoverContent>
  </Popover>
);

interface MetricsData {
  totalReviews: number;
  avgRating: number;
  replyRate: number;
  avgResponseTime: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  platformCounts: Record<string, number>;
  ratingDistribution: Record<number, number>;
  ratingTrend: number;
  topKeywords: [string, number][];
}

interface OverviewProps {
  businessProfile: GoogleBusinessProfile | null;
}

const Overview: NextPageWithLayout<OverviewProps> = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { toast } = useToast();

  // State for data and loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<GoogleBusinessProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

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
        setBusinessProfile(data.businessProfile);
        setReviews(data.reviews);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [slug]);

  // Calculate metrics
  const metrics = useMemo<MetricsData | null>(() => {
    if (!reviews.length) return null;

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / totalReviews;
    
    // Calculate reply rate
    const repliedReviews = reviews.filter(r => r.reply).length;
    const replyRate = (repliedReviews / totalReviews) * 100;

    // Calculate average response time
    const responseTimes = reviews
      .filter(r => r.reply)
      .map(r => new Date(r.updatedAt).getTime() - new Date(r.date).getTime());
    const avgResponseTime = responseTimes.length 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60 * 60 * 24)
      : 0;

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment && r.sentiment > 0.33).length,
      neutral: reviews.filter(r => r.sentiment && r.sentiment >= -0.33 && r.sentiment <= 0.33).length,
      negative: reviews.filter(r => r.sentiment && r.sentiment < -0.33).length
    };

    const totalSentiment = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    const sentimentDistribution = {
      positive: (sentimentCounts.positive / totalSentiment) * 100,
      neutral: (sentimentCounts.neutral / totalSentiment) * 100,
      negative: (sentimentCounts.negative / totalSentiment) * 100
    };

    // Calculate platform distribution
    const platformCounts = reviews.reduce((acc, review) => {
      acc[review.source] = (acc[review.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce((acc, review) => {
      const rating = Math.floor(review.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate trends
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReviews = reviews.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const recentAvgRating = recentReviews.length
      ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
      : 0;
    const ratingTrend = ((recentAvgRating - avgRating) / avgRating) * 100;

    // Extract keywords
    const keywords = reviews.reduce((acc, review) => {
      if (review.keywords) {
        const reviewKeywords = Array.isArray(review.keywords) 
          ? review.keywords 
          : JSON.parse(review.keywords);
        reviewKeywords.forEach(keyword => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Get top keywords
    const topKeywords = Object.entries(keywords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5) as [string, number][];

    return {
      totalReviews,
      avgRating,
      replyRate,
      avgResponseTime,
      sentimentDistribution,
      platformCounts,
      ratingDistribution,
      ratingTrend,
      topKeywords
    };
  }, [reviews]);

  // Function to sync reviews
  const syncReviews = async () => {
    if (!slug) return;

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

      // Update reviews if we have fresh data
      if (data.freshData) {
        setReviews(prev => [
          ...prev,
          ...data.reviews.filter(
            (r: Review) => !prev.some(existingReview => existingReview.id === r.id)
          ),
        ]);
      }

      toast({
        title: data.message || 'Successfully synced reviews',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error syncing reviews:', error);
      toast({
        title: error.message || 'An error occurred during sync',
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <ExclamationCircleIcon className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">{t('error-occurred')}</h2>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <ExclamationCircleIcon className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">{t('no-business-profile')}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t('add-google-maps-url')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{businessProfile.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{businessProfile.categoryName}</Badge>
            {businessProfile.totalScore && (
              <Badge variant="outline" className="flex items-center gap-1">
                <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                {businessProfile.totalScore.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={syncReviews} variant="outline" className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4" />
          {t('sync-reviews')}
        </Button>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('business-information')}</CardTitle>
          <CardDescription>{t('contact-and-location-details')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessProfile.address && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{businessProfile.address}</p>
                <p className="text-sm text-muted-foreground">
                  {[
                    businessProfile.city,
                    businessProfile.state,
                    businessProfile.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
          
          {businessProfile.phone && (
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{businessProfile.phone}</p>
                <p className="text-sm text-muted-foreground">{t('business-phone')}</p>
              </div>
            </div>
          )}

          {businessProfile.popularTimesLiveText && (
            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{businessProfile.popularTimesLiveText}</p>
                <p className="text-sm text-muted-foreground">{t('current-popularity')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Average Rating */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('average-rating')}
                </CardTitle>
                <InfoButton content={
                  <>
                    <p className="text-sm">
                      {t('average-rating-explanation')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('average-rating-suggestion')}
                    </p>
                  </>
                } />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold mr-2">
                  {metrics.avgRating.toFixed(1)}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < metrics.avgRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={cn(
                  "text-sm flex items-center",
                  metrics.ratingTrend > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.ratingTrend > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(metrics.ratingTrend).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {t('vs-last-30-days')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('total-reviews')}
                </CardTitle>
                <InfoButton content={
                  <>
                    <p className="text-sm">
                      {t('total-reviews-explanation')}
                    </p>
                  </>
                } />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-500 mr-2" />
                <span className="text-3xl font-bold">
                  {metrics.totalReviews}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {t('across-all-platforms')}
              </div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('response-rate')}
                </CardTitle>
                <InfoButton content={
                  <>
                    <p className="text-sm">
                      {t('response-rate-explanation')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('response-rate-suggestion')}
                    </p>
                  </>
                } />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-3xl font-bold">
                  {Math.round(metrics.replyRate)}%
                </span>
              </div>
              <div className="mt-2">
                <Progress value={metrics.replyRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Average Response Time */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('avg-response-time')}
                </CardTitle>
                <InfoButton content={
                  <>
                    <p className="text-sm">
                      {t('avg-response-time-explanation')}
                    </p>
                  </>
                } />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-500 mr-2" />
                <span className="text-3xl font-bold">
                  {Math.round(metrics.avgResponseTime)}
                </span>
                <span className="text-lg ml-1">{t('days')}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {metrics.avgResponseTime <= 1
                  ? t('excellent-response-time')
                  : metrics.avgResponseTime <= 3
                  ? t('good-response-time')
                  : t('needs-improvement')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rating-distribution')}</CardTitle>
              <CardDescription>{t('breakdown-by-stars')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = metrics.ratingDistribution[rating] || 0;
                  const percentage = (count / metrics.totalReviews) * 100;
                  
                  return (
                    <div key={rating}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <span className="text-sm mr-2">{rating}</span>
                          <div className="flex">
                            {[...Array(rating)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>{t('sentiment-analysis')}</CardTitle>
              <CardDescription>{t('customer-sentiment-breakdown')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('positive')}</span>
                    <span className="text-sm font-medium text-green-600">
                      {metrics.sentimentDistribution.positive.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.sentimentDistribution.positive}
                    className="h-2 bg-muted"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('neutral')}</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {metrics.sentimentDistribution.neutral.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.sentimentDistribution.neutral}
                    className="h-2 bg-muted"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('negative')}</span>
                    <span className="text-sm font-medium text-red-600">
                      {metrics.sentimentDistribution.negative.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.sentimentDistribution.negative}
                    className="h-2 bg-muted"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">{t('top-keywords')}</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.topKeywords.map(([keyword, count]) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="text-xs"
                    >
                      {keyword} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('platform-distribution')}</CardTitle>
              <CardDescription>{t('reviews-by-platform')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metrics.platformCounts).map(([platform, count]) => {
                  const percentage = (count / metrics.totalReviews) * 100;
                  const platformName = platform === MarketPlatform.GOOGLE_MAPS
                    ? 'Google'
                    : platform === MarketPlatform.FACEBOOK
                    ? 'Facebook'
                    : platform === MarketPlatform.YELP
                    ? 'Yelp'
                    : platform;

                  return (
                    <div
                      key={platform}
                      className="bg-muted/50 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{platformName}</span>
                        <Badge variant="outline">
                          {count} {t('reviews')}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}% {t('of-total')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('recent-reviews')}</CardTitle>
            <CardDescription>{t('latest-customer-feedback')}</CardDescription>
          </div>
          <Link href={`/teams/${slug}/reviews`}>
            <Button variant="outline" size="sm">
              {t('view-all')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {review.authorImage ? (
                        <img
                          src={review.authorImage}
                          alt={review.author}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <UserGroupIcon className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{review.author}</p>
                        <span className="mx-2">•</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(review.date), 'MMM d, yyyy')}
                      </p>
                      <p className="mt-2 text-sm line-clamp-2">{review.text}</p>
                      {review.reply && (
                        <div className="mt-2 pl-4 border-l-2 border-border">
                          <p className="text-xs font-medium">{t('business-reply')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {review.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {review.source === MarketPlatform.GOOGLE_MAPS
                      ? 'Google'
                      : review.source === MarketPlatform.FACEBOOK
                      ? 'Facebook'
                      : review.source === MarketPlatform.YELP
                      ? 'Yelp'
                      : review.source}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
  params,
}: GetServerSidePropsContext) => {
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

export default Overview;
import { useTranslation } from 'next-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface ReviewStatsProps {
  totalReviews: number;
  averageRating: number;
  repliedReviewsPercentage: number;
  positiveReviewsPercentage: number;
  neutralReviewsPercentage: number;
  negativeReviewsPercentage: number;
}

export const ReviewStats = ({
  totalReviews,
  averageRating,
  repliedReviewsPercentage,
  positiveReviewsPercentage,
  neutralReviewsPercentage,
  negativeReviewsPercentage
}: ReviewStatsProps) => {
  const { t } = useTranslation('common');

  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`text-xl ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-muted'}`}
            aria-label="star"
          >
            {'\u2605'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {/* Average Rating */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('average-rating')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2">
              {formatRating(averageRating)}
            </span>
            <div className="flex-1">
              {renderStars(averageRating)}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('from-reviews', { count: totalReviews })}
          </p>
        </CardContent>
      </Card>

      {/* Response Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('response-rate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {Math.round(repliedReviewsPercentage)}%
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('of-reviews-replied')}
          </p>
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('sentiment-breakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t('positive')}</span>
                <span className="text-sm font-medium">{Math.round(positiveReviewsPercentage)}%</span>
              </div>
              <Progress className="bg-muted h-2" value={positiveReviewsPercentage} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t('neutral')}</span>
                <span className="text-sm font-medium">{Math.round(neutralReviewsPercentage)}%</span>
              </div>
              <Progress className="bg-muted h-2" value={neutralReviewsPercentage} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{t('negative')}</span>
                <span className="text-sm font-medium">{Math.round(negativeReviewsPercentage)}%</span>
              </div>
              <Progress className="bg-muted h-2" value={negativeReviewsPercentage} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
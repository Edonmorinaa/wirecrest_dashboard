import { Review, MarketPlatform } from '@prisma/client';

// Custom type properties that extend the base Review type
export interface ExtendedReviewProps {
  platform: MarketPlatform;  // Retained for backward compatibility
}

// ExtendedReview combines the Prisma Review with our custom properties
export type ExtendedReview = Review & ExtendedReviewProps;

// Helper function to convert between platform and source
export const getProviderDisplayName = (platform: MarketPlatform): string => {
  switch (platform) {
    case MarketPlatform.GOOGLE_MAPS:
      return 'Google';
    case MarketPlatform.FACEBOOK:
      return 'Facebook';
    case MarketPlatform.YELP:
      return 'Yelp';
    default:
      return 'Unknown';
  }
};

// Helper function to adapt a Review to an ExtendedReview
export const adaptReviewToExtended = (review: Review): ExtendedReview => {
  return {
    ...review,
    platform: review.source // Map source to platform for backward compatibility
  };
};

// Helper function to adapt an ExtendedReview to a standard Review
export const adaptExtendedToReview = (extendedReview: ExtendedReview): Review => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { platform, ...reviewProps } = extendedReview;
  return reviewProps;
}; 
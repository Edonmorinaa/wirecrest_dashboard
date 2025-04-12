import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApifyClient } from 'apify-client';
import { MarketPlatform } from '@prisma/client';
import { analyzeReview, calculateResponseUrgency, analyzeCompetitiveInsights } from '@/lib/nlp';

// 12 hours in milliseconds for rate limiting
// const SCRAPE_INTERVAL_MS = 12 * 60 * 60 * 1000;
const SCRAPE_INTERVAL_MS = 3 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { teamSlug } = req.body;

  if (!teamSlug) {
    return res.status(400).json({ error: { message: 'Team slug is required' } });
  }

  try {
    // Get the team by slug
    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
    });

    if (!team) {
      return res.status(404).json({ error: { message: 'Team not found' } });
    }

    // Check when we last scraped reviews for this team
    const latestReview = await prisma.review.findFirst({
      where: {
        teamId: team.id,
        source: MarketPlatform.GOOGLE_MAPS,
      },
      orderBy: {
        scrapedAt: 'desc',
      },
    });

    const now = new Date();
    const lastScrapeTime = latestReview?.scrapedAt;
    const timeSinceLastScrape = lastScrapeTime ? now.getTime() - lastScrapeTime.getTime() : Infinity;

    // If we've scraped within the last 12 hours, return existing reviews instead
    if (lastScrapeTime && timeSinceLastScrape < SCRAPE_INTERVAL_MS) {
      const existingReviews = await prisma.review.findMany({
        where: {
          teamId: team.id,
          source: MarketPlatform.GOOGLE_MAPS,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return res.status(200).json({
        success: true,
        message: `Using existing reviews. Next scrape available in ${Math.ceil((SCRAPE_INTERVAL_MS - timeSinceLastScrape) / (60 * 60 * 1000))} hours.`,
        reviews: existingReviews,
        freshData: false,
      });
    }

    // Get the Google Maps identifier for this team
    const googleMapsIdentifier = await prisma.businessMarketIdentifier.findUnique({
      where: {
        teamId_platform: {
          teamId: team.id,
          platform: MarketPlatform.GOOGLE_MAPS,
        },
      },
    });

    if (!googleMapsIdentifier || !googleMapsIdentifier.url) {
      return res.status(404).json({ 
        error: { message: 'Google Maps URL not found for this team' } 
      });
    }

    // Initialize ApifyClient
    const apifyClient = new ApifyClient({
      token: process.env.APIFY_TOKEN || '',
    });

    // Prepare Actor input
    const input = {
      startUrls: [{ url: googleMapsIdentifier.url }],
      maxReviews: 500,
      reviewsSort: "newest",
      language: "en",
      reviewsOrigin: "all",
      personalData: true
    };

    // Run the Actor and wait for it to finish
    const run = await apifyClient.actor("Xb8osYTtOjlsgI6k9").call(input);

    // Fetch results from the run's dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Process reviews
    const createdReviews = await Promise.all(
      items.map(async (item: any) => {
        // Get business category from the item if available
        const businessCategory = item.categoryName || '';
        
        // Default values for NLP analysis
        let reviewAnalysis = {
          sentiment: 0,
          keywords: [] as string[],
          topics: [] as string[],
          emotional: 'neutral',
          actionable: false
        };
        let responseUrgency = 5;
        let competitiveInsights = {
          competitorMentions: [] as string[],
          comparativePositive: false
        };
        
        try {
          // Run NLP analysis on the review text
          reviewAnalysis = analyzeReview(item.text, item.stars, businessCategory);
          
          // Store these values to include in labels for all cases
          responseUrgency = calculateResponseUrgency(item.text, item.stars, (item.reviewImageUrls?.length || 0) > 0);
          competitiveInsights = analyzeCompetitiveInsights(item.text);
        } catch (error) {
          console.error('Error running NLP analysis:', error);
          // Continue with default values if NLP analysis fails
        }
        
        // Add response urgency to labels for all reviews
        const defaultLabels: string[] = [];
        if (responseUrgency >= 8) {
          defaultLabels.push('urgent');
        } else if (responseUrgency >= 5) {
          defaultLabels.push('medium-priority');
        }
        
        // Add competitor mentions to labels
        if (competitiveInsights.competitorMentions.length > 0) {
          defaultLabels.push('mentions-competitor');
          if (competitiveInsights.comparativePositive) {
            defaultLabels.push('favorable-comparison');
          } else {
            defaultLabels.push('unfavorable-comparison');
          }
        }
        
        try {
          // First try to create or update the Review record with all fields
          const review = await prisma.review.upsert({
            where: {
              teamId_source_externalId: {
                teamId: team.id,
                source: MarketPlatform.GOOGLE_MAPS,
                externalId: item.reviewId
              }
            },
            update: {
              author: item.name,
              authorImage: item.reviewerPhotoUrl,
              rating: item.stars,
              text: item.text || '',
              date: new Date(item.publishedAtDate),
              photoCount: item.reviewImageUrls?.length || 0,
              photoUrls: item.reviewImageUrls || [],
              reply: item.responseFromOwnerText,
              replyDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              hasReply: !!item.responseFromOwnerText,
              sentiment: reviewAnalysis.sentiment,
              keywords: reviewAnalysis.keywords,
              language: item.originalLanguage || 'en',
              scrapedAt: new Date(),
              sourceUrl: item.reviewUrl,
              isRead: false,
              isImportant: false,
              labels: defaultLabels
            },
            create: {
              teamId: team.id,
              externalId: item.reviewId,
              source: MarketPlatform.GOOGLE_MAPS,
              author: item.name,
              authorImage: item.reviewerPhotoUrl,
              rating: item.stars,
              text: item.text || '',
              date: new Date(item.publishedAtDate),
              photoCount: item.reviewImageUrls?.length || 0,
              photoUrls: item.reviewImageUrls || [],
              reply: item.responseFromOwnerText,
              replyDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              hasReply: !!item.responseFromOwnerText,
              sentiment: reviewAnalysis.sentiment,
              keywords: reviewAnalysis.keywords,
              language: item.originalLanguage || 'en',
              scrapedAt: new Date(),
              sourceUrl: item.reviewUrl,
              isRead: false,
              isImportant: false,
              labels: defaultLabels
            }
          });

          // Then create or update the GoogleReview record
          await prisma.googleReview.upsert({
            where: {
              reviewId: review.id
            },
            update: {
              reviewerId: item.reviewerId,
              reviewerUrl: item.reviewerUrl,
              name: item.name,
              reviewerNumberOfReviews: item.reviewerNumberOfReviews,
              isLocalGuide: item.isLocalGuide,
              reviewerPhotoUrl: item.reviewerPhotoUrl,
              text: item.text,
              textTranslated: item.textTranslated,
              publishAt: item.publishAt,
              publishedAtDate: new Date(item.publishedAtDate),
              likesCount: item.likesCount,
              reviewUrl: item.reviewUrl,
              reviewOrigin: item.reviewOrigin,
              stars: item.stars,
              rating: item.rating,
              responseFromOwnerDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              responseFromOwnerText: item.responseFromOwnerText,
              reviewImageUrls: item.reviewImageUrls || [],
              reviewContext: item.reviewContext,
              reviewDetailedRating: item.reviewDetailedRating,
              visitedIn: item.visitedIn,
              originalLanguage: item.originalLanguage,
              translatedLanguage: item.translatedLanguage,
              isAdvertisement: item.isAdvertisement,
              placeId: item.placeId,
              location: item.location,
              address: item.address,
              neighborhood: item.neighborhood,
              street: item.street,
              city: item.city,
              postalCode: item.postalCode,
              state: item.state,
              countryCode: item.countryCode,
              categoryName: item.categoryName,
              categories: item.categories,
              title: item.title,
              totalScore: item.totalScore,
              permanentlyClosed: item.permanentlyClosed,
              temporarilyClosed: item.temporarilyClosed,
              reviewsCount: item.reviewsCount,
              url: item.url,
              price: item.price,
              cid: item.cid,
              fid: item.fid,
              imageUrl: item.imageUrl,
              scrapedAt: new Date(item.scrapedAt),
              language: item.language
            },
            create: {
              reviewId: review.id,
              reviewerId: item.reviewerId,
              reviewerUrl: item.reviewerUrl,
              name: item.name,
              reviewerNumberOfReviews: item.reviewerNumberOfReviews,
              isLocalGuide: item.isLocalGuide,
              reviewerPhotoUrl: item.reviewerPhotoUrl,
              text: item.text,
              textTranslated: item.textTranslated,
              publishAt: item.publishAt,
              publishedAtDate: new Date(item.publishedAtDate),
              likesCount: item.likesCount,
              reviewUrl: item.reviewUrl,
              reviewOrigin: item.reviewOrigin,
              stars: item.stars,
              rating: item.rating,
              responseFromOwnerDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              responseFromOwnerText: item.responseFromOwnerText,
              reviewImageUrls: item.reviewImageUrls || [],
              reviewContext: item.reviewContext,
              reviewDetailedRating: item.reviewDetailedRating,
              visitedIn: item.visitedIn,
              originalLanguage: item.originalLanguage,
              translatedLanguage: item.translatedLanguage,
              isAdvertisement: item.isAdvertisement,
              placeId: item.placeId,
              location: item.location,
              address: item.address,
              neighborhood: item.neighborhood,
              street: item.street,
              city: item.city,
              postalCode: item.postalCode,
              state: item.state,
              countryCode: item.countryCode,
              categoryName: item.categoryName,
              categories: item.categories,
              title: item.title,
              totalScore: item.totalScore,
              permanentlyClosed: item.permanentlyClosed,
              temporarilyClosed: item.temporarilyClosed,
              reviewsCount: item.reviewsCount,
              url: item.url,
              price: item.price,
              cid: item.cid,
              fid: item.fid,
              imageUrl: item.imageUrl,
              scrapedAt: new Date(item.scrapedAt),
              language: item.language
            }
          });

          return review;
        } catch (error) {
          console.error('Error processing review with advanced sentiment fields:', error);
          
          // If there was an error with the new fields, try just the basic fields
          const review = await prisma.review.upsert({
            where: {
              teamId_source_externalId: {
                teamId: team.id,
                source: MarketPlatform.GOOGLE_MAPS,
                externalId: item.reviewId
              }
            },
            update: {
              author: item.name,
              authorImage: item.reviewerPhotoUrl,
              rating: item.stars,
              text: item.text || '',
              date: new Date(item.publishedAtDate),
              photoCount: item.reviewImageUrls?.length || 0,
              photoUrls: item.reviewImageUrls || [],
              reply: item.responseFromOwnerText,
              replyDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              hasReply: !!item.responseFromOwnerText,
              sentiment: reviewAnalysis.sentiment,
              keywords: reviewAnalysis.keywords,
              language: item.originalLanguage || 'en',
              scrapedAt: new Date(),
              sourceUrl: item.reviewUrl,
              isRead: false,
              isImportant: false,
              labels: defaultLabels
            },
            create: {
              teamId: team.id,
              externalId: item.reviewId,
              source: MarketPlatform.GOOGLE_MAPS,
              author: item.name,
              authorImage: item.reviewerPhotoUrl,
              rating: item.stars,
              text: item.text || '',
              date: new Date(item.publishedAtDate),
              photoCount: item.reviewImageUrls?.length || 0,
              photoUrls: item.reviewImageUrls || [],
              reply: item.responseFromOwnerText,
              replyDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              hasReply: !!item.responseFromOwnerText,
              sentiment: reviewAnalysis.sentiment,
              keywords: reviewAnalysis.keywords,
              language: item.originalLanguage || 'en',
              scrapedAt: new Date(),
              sourceUrl: item.reviewUrl,
              isRead: false,
              isImportant: false,
              labels: defaultLabels
            }
          });
          
          // Then create or update the GoogleReview record
          await prisma.googleReview.upsert({
            where: {
              reviewId: review.id
            },
            update: {
              reviewerId: item.reviewerId,
              reviewerUrl: item.reviewerUrl,
              name: item.name,
              reviewerNumberOfReviews: item.reviewerNumberOfReviews,
              isLocalGuide: item.isLocalGuide,
              reviewerPhotoUrl: item.reviewerPhotoUrl,
              text: item.text,
              textTranslated: item.textTranslated,
              publishAt: item.publishAt,
              publishedAtDate: new Date(item.publishedAtDate),
              likesCount: item.likesCount,
              reviewUrl: item.reviewUrl,
              reviewOrigin: item.reviewOrigin,
              stars: item.stars,
              rating: item.rating,
              responseFromOwnerDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              responseFromOwnerText: item.responseFromOwnerText,
              reviewImageUrls: item.reviewImageUrls || [],
              reviewContext: item.reviewContext,
              reviewDetailedRating: item.reviewDetailedRating,
              visitedIn: item.visitedIn,
              originalLanguage: item.originalLanguage,
              translatedLanguage: item.translatedLanguage,
              isAdvertisement: item.isAdvertisement,
              placeId: item.placeId,
              location: item.location,
              address: item.address,
              neighborhood: item.neighborhood,
              street: item.street,
              city: item.city,
              postalCode: item.postalCode,
              state: item.state,
              countryCode: item.countryCode,
              categoryName: item.categoryName,
              categories: item.categories,
              title: item.title,
              totalScore: item.totalScore,
              permanentlyClosed: item.permanentlyClosed,
              temporarilyClosed: item.temporarilyClosed,
              reviewsCount: item.reviewsCount,
              url: item.url,
              price: item.price,
              cid: item.cid,
              fid: item.fid,
              imageUrl: item.imageUrl,
              scrapedAt: new Date(item.scrapedAt),
              language: item.language
            },
            create: {
              reviewId: review.id,
              reviewerId: item.reviewerId,
              reviewerUrl: item.reviewerUrl,
              name: item.name,
              reviewerNumberOfReviews: item.reviewerNumberOfReviews,
              isLocalGuide: item.isLocalGuide,
              reviewerPhotoUrl: item.reviewerPhotoUrl,
              text: item.text,
              textTranslated: item.textTranslated,
              publishAt: item.publishAt,
              publishedAtDate: new Date(item.publishedAtDate),
              likesCount: item.likesCount,
              reviewUrl: item.reviewUrl,
              reviewOrigin: item.reviewOrigin,
              stars: item.stars,
              rating: item.rating,
              responseFromOwnerDate: item.responseFromOwnerDate ? new Date(item.responseFromOwnerDate) : null,
              responseFromOwnerText: item.responseFromOwnerText,
              reviewImageUrls: item.reviewImageUrls || [],
              reviewContext: item.reviewContext,
              reviewDetailedRating: item.reviewDetailedRating,
              visitedIn: item.visitedIn,
              originalLanguage: item.originalLanguage,
              translatedLanguage: item.translatedLanguage,
              isAdvertisement: item.isAdvertisement,
              placeId: item.placeId,
              location: item.location,
              address: item.address,
              neighborhood: item.neighborhood,
              street: item.street,
              city: item.city,
              postalCode: item.postalCode,
              state: item.state,
              countryCode: item.countryCode,
              categoryName: item.categoryName,
              categories: item.categories,
              title: item.title,
              totalScore: item.totalScore,
              permanentlyClosed: item.permanentlyClosed,
              temporarilyClosed: item.temporarilyClosed,
              reviewsCount: item.reviewsCount,
              url: item.url,
              price: item.price,
              cid: item.cid,
              fid: item.fid,
              imageUrl: item.imageUrl,
              scrapedAt: new Date(item.scrapedAt),
              language: item.language
            }
          });
          
          return review;
        }
      })
    );

    return res.status(200).json({ 
      success: true, 
      message: `Successfully synced ${createdReviews.length} Google reviews`, 
      reviews: createdReviews,
      freshData: true
    });
  } catch (error: any) {
    console.error('Error syncing Google reviews:', error);
    return res.status(500).json({ 
      error: { message: `Failed to sync Google reviews: ${error.message}` } 
    });
  }
} 
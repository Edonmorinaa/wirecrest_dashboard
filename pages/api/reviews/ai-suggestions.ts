import type { NextApiRequest, NextApiResponse } from 'next';

type SuggestionData = {
  suggestions: Array<{
    id: string;
    reason: string;
  }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuggestionData>
) {
  // Implement actual logic here
  // For now, return mock data to avoid the 500 error
  
  // Get the team slug from the query parameters
  const { teamSlug } = req.query;
  
  if (!teamSlug || typeof teamSlug !== 'string') {
    return res.status(400).json({ suggestions: [] });
  }

  // Simulate some processing time for a more realistic API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock suggestions data
  return res.status(200).json({
    suggestions: [
      {
        id: 'mock-review-1',
        reason: 'Contains keyword "service" with negative sentiment'
      },
      {
        id: 'mock-review-2',
        reason: 'Recent 1-star review that needs attention'
      },
      {
        id: 'mock-review-3',
        reason: 'Trending keyword mention of "price" in multiple reviews'
      }
    ]
  });
} 
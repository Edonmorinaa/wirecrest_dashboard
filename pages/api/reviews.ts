import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { teamSlug } = req.query;

  if (!teamSlug || Array.isArray(teamSlug)) {
    return res.status(400).json({ error: { message: 'Team slug is required' } });
  }

  try {
    // Get team
    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
    });

    if (!team) {
      return res.status(404).json({ error: { message: 'Team not found' } });
    }

    // Get business profile
    const businessProfile = await prisma.googleBusinessProfile.findFirst({
      where: { teamId: team.id },
    });

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { teamId: team.id },
      orderBy: { date: 'desc' },
    });

    // Serialize the data to handle Date objects and any other non-serializable types
    const serializedData = {
      businessProfile: businessProfile ? JSON.parse(JSON.stringify(businessProfile)) : null,
      reviews: JSON.parse(JSON.stringify(reviews)),
    };

    return res.status(200).json(serializedData);
  } catch (error: any) {
    console.error('Error fetching team reviews:', error);
    return res.status(500).json({ 
      error: { message: `Failed to fetch reviews: ${error.message}` } 
    });
  }
} 
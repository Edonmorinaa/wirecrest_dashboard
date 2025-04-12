import {  throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createBusinessMarketIdentifier, getAllBusinessMarketIdentifiers } from 'models/business-market-identifier';
import { MarketPlatform, BusinessMarketIdentifier } from '@prisma/client';
import { createBusinessMarketIndetifiersSchema, validateWithSchema } from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get teams
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  const marketIdentifiers = await getAllBusinessMarketIdentifiers(teamMember.teamId)

  recordMetric('business-market-identifier.fetched');

  res.status(200).json({ data: marketIdentifiers });
};

// Create a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);

  console.log(req.body)
  const { platform, url } = validateWithSchema(
    createBusinessMarketIndetifiersSchema,
    req.body as { platform: string, url: string}
  );

  // Create a new business market identifier
  const marketIdentifier = await createBusinessMarketIdentifier(
    {
      teamId: teamMember.teamId,
      platform: platform as string,
      url: url as string
    } as BusinessMarketIdentifier,
    teamMember.teamId,
    platform as MarketPlatform
  );

  res.status(200).json({ data: { marketIdentifier } }); // Return both team and marketIdentifier
};

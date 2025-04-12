import { slugify } from '@/lib/server-common';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createTeamSchema, validateWithSchema } from '@/lib/zod';
import { getCurrentUser } from 'models/user';

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
  const user = await getCurrentUser(req, res);
  const teams = await getTeams(user.id);

  recordMetric('team.fetched');

  res.status(200).json({ data: teams });
};

// Create a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('POST /api/teams - Starting, body:', req.body);
  const { name } = validateWithSchema(createTeamSchema, req.body);
  console.log('Validated name:', name);
  
  const user = await getCurrentUser(req, res);
  console.log('User fetched:', user.id);
  const slug = slugify(name);
  console.log('Generated slug:', slug);

  if (await isTeamExists(slug)) {
    throw new ApiError(400, 'A team with the slug already exists.');
  }

  console.log('Creating team with params:', { userId: user.id, name, slug });
  const team = await createTeam({
    userId: user.id,
    name,
    slug,
  });
  console.log('Team created:', team);

  recordMetric('team.created');

  console.log('Metric recorded');
  res.status(200).json({ data: team });
};

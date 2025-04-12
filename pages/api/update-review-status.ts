import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { reviewId, field, value } = req.body;

  if (!reviewId) {
    return res.status(400).json({ error: { message: 'Review ID is required' } });
  }

  if (!field || (field !== 'isImportant' && field !== 'isRead')) {
    return res.status(400).json({ error: { message: 'Valid field is required (isImportant or isRead)' } });
  }

  if (typeof value !== 'boolean') {
    return res.status(400).json({ error: { message: 'Value must be a boolean' } });
  }

  try {
    // Update the review status
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { [field]: value },
    });

    const fieldName = field === 'isImportant' ? 'importance' : 'read status';
    return res.status(200).json({
      success: true,
      message: `Review ${fieldName} updated successfully`,
      review,
    });
  } catch (error: any) {
    console.error('Error updating review status:', error);
    return res.status(500).json({
      error: { message: `Failed to update review status: ${error.message}` }
    });
  }
} 
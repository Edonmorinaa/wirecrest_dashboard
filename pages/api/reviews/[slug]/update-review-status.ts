import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ResponseData = {
  message: string;
  review?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed', error: 'Only PATCH method is supported' });
  }
  
  try {
    const { slug } = req.query;
    const { isRead, isImportant, reply } = req.body;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Invalid review ID', error: 'Review ID is required' });
    }
    
    // Create update object with only the fields that were passed
    const updateData: any = {};
    
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isImportant !== undefined) updateData.isImportant = isImportant;
    if (reply !== undefined) {
      updateData.reply = reply;
      // If we're updating the reply, also set repliedAt
      updateData.repliedAt = new Date();
    }
    
    // Update the review with Prisma
    const updatedReview = await prisma.review.update({
      where: { id: slug },
      data: updateData
    });
    
    return res.status(200).json({
      message: 'Review status updated successfully',
      review: updatedReview
    });
  } catch (error: any) {
    console.error('Error updating review status:', error);
    return res.status(500).json({
      message: 'Failed to update review status',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 
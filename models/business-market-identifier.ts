import { prisma } from '@/lib/prisma';
import { BusinessMarketIdentifier, MarketPlatform } from '@prisma/client';

export const createBusinessMarketIdentifier = async (
  identifier: Omit<BusinessMarketIdentifier, 'id' | 'createdAt' | 'updatedAt'>,
  teamId: string,
  platform: MarketPlatform
) => {
  
  return await prisma.businessMarketIdentifier.upsert({
    create: {
      ...identifier,
      teamId,
      platform,
    },
    update: identifier,
    where: {
      teamId_platform: {
        teamId,
        platform,
      },
    },
  });
};

export const getBusinessMarketIdentifier = async (
  teamId: string,
  platform: MarketPlatform
) => {
  return await prisma.businessMarketIdentifier.findUnique({
    where: {
      teamId_platform: {
        teamId,
        platform,
      },
    },
  });
};

export const getAllBusinessMarketIdentifiers = async (teamId: string) => {
  return await prisma.businessMarketIdentifier.findMany({
    where: {
      teamId,
    },
  });
};

export const updateBusinessMarketIdentifier = async (
  identifier: BusinessMarketIdentifier,
  teamId: string,
  platform: MarketPlatform
) => {
  return await prisma.businessMarketIdentifier.update({
    where: {
      teamId_platform: {
        teamId,
        platform,
      },
    },
    data: identifier,
  });
};
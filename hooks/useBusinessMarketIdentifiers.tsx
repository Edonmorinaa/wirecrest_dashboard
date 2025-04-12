import fetcher from '@/lib/fetcher';
import { BusinessMarketIdentifier } from '@prisma/client';
import useSWR, { mutate } from 'swr';
import type { ApiResponse } from 'types';

const useBusinessMarketIdentifiers = (params: {teamId: string}) => {
  const url = `/api/business-market-identifiers/${params.teamId}`;

  const { data, error, isLoading } = useSWR<ApiResponse<BusinessMarketIdentifier[]>>(
    url,
    fetcher
  );

  const mutateBusinessMarketIdentifiers = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    businessMarketIdentifiers: data?.data,
    mutateBusinessMarketIdentifiers,
  };
};

export default useBusinessMarketIdentifiers;

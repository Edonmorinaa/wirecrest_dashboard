import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { BusinessMarketIdentifier, MarketPlatform, Team } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import type { ApiResponse } from 'types';

import { AccessControl } from '../shared/AccessControl';
import { z } from 'zod';
import { urlSchema } from '@/lib/zod';
import useBusinessMarketIdentifiers from 'hooks/useBusinessMarketIdentifiers';
import { useToast } from '../ui/use-toast';

const CreateMarketIdentifiers = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const { toast } = useToast()
  const { businessMarketIdentifiers, mutateBusinessMarketIdentifiers } = useBusinessMarketIdentifiers({teamId: team.id});
    
  const googleMarketIdentifier: BusinessMarketIdentifier | undefined = businessMarketIdentifiers?.find((item) => {
        return item.platform === MarketPlatform.GOOGLE_MAPS;
    });

    // const facebookMarketIdentifier: BusinessMarketIdentifier | undefined = businessMarketIdentifiers?.find((item) => {
    //     return item.platform === MarketPlatform.FACEBOOK;
    // });

  const formik = useFormik<z.infer<typeof urlSchema>>({
    initialValues: {
      url: googleMarketIdentifier?.url ?? ""
    },
    validateOnBlur: false,
    enableReinitialize: true,
    validate: (values) => {
      try {
        urlSchema.parse(values);
      } catch (error: any) {
        return error.formErrors.fieldErrors;
      }
    },
    onSubmit: async (values) => {
        const marketIdentifier: Pick<BusinessMarketIdentifier, 'teamId' | 'platform' | 'url'> = {
            teamId: team.id,
            platform: MarketPlatform.GOOGLE_MAPS,
            url: values.url
        }
      const response = await fetch(`/api/business-market-identifiers/${team.slug}`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(marketIdentifier),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast({
          title: json.error.message,
          variant: "destructive"
        })
        return;
      }

      toast({
        title: "Updated Google Market Identifier"
      })
      mutateBusinessMarketIdentifiers();
      values.url = ""
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>{t('market-identifiers')}</Card.Title>
              {/* <Card.Title>{t('team-settings')}</Card.Title> */}
              {/* <Card.Description>{t('team-settings-config')}</Card.Description> */}
              <Card.Description>{t('google-places-url')}</Card.Description>
            </Card.Header>
            <div className="flex flex-col gap-4">
              <InputWithLabel
                name="url"
                label={t('google-places-url')}
                value={formik.values.url}
                onChange={formik.handleChange}
                error={formik.errors.url}
              />
            </div>
          </Card.Body>
          <AccessControl resource="team" actions={['update']}>
            <Card.Footer>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid || !formik.dirty}
                  size="md"
                >
                  {t('save-changes')}
                </Button>
              </div>
            </Card.Footer>
          </AccessControl>
        </Card>
      </form>
    </>
  );
};

export default CreateMarketIdentifiers;

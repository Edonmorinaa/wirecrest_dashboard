import { Cog6ToothIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('overview'),
      href: `/teams/${slug}/overview`,
      icon: CodeBracketIcon,
      active: activePathname?.startsWith(`/teams/${slug}`) &&
      activePathname.includes('overview'),
    },
    {
      name: t('reviews'),
      href: `/teams/${slug}/reviews`,
      icon: CodeBracketIcon,
      active: activePathname?.startsWith(`/teams/${slug}`) &&
      activePathname.includes('reviews'),
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        activePathname.includes('settings'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;

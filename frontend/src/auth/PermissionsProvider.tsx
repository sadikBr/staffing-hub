import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/api/client';
import { unwrap } from '@/api/errors';
import { FullPageLoader } from '@/components/FullPageStatus';
import { FULL_PERMISSIONS, PermissionsContext } from './permissions';

/** Loads what the current user may do before showing the app, so that buttons do not appear then vanish. */
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(api.GET('/api/me')), staleTime: Infinity, retry: 1 });

  if (me.isPending) return <FullPageLoader label={t('startup.loadingPermissions')} />;
  // If the role cannot be loaded, show everything: the API still refuses what the user may not do.
  return <PermissionsContext.Provider value={me.data ?? FULL_PERMISSIONS}>{children}</PermissionsContext.Provider>;
}

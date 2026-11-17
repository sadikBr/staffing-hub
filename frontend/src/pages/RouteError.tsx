import { useTranslation } from 'react-i18next';
import { FullPageError } from '@/components/FullPageStatus';

/** Shown if a page crashes, or if a new version was deployed and an old page chunk no longer exists. */
export function RouteError() {
  const { t } = useTranslation();
  return (
    <FullPageError
      title={t('errors.crashTitle')}
      message={t('errors.crashMessage')}
      actionLabel={t('errors.reloadPage')}
      onAction={() => window.location.reload()}
    />
  );
}

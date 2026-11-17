import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { configureApiAuth } from '@/api/client';
import type { AppConfig } from '@/api/types';
import { FullPageError, FullPageLoader } from '@/components/FullPageStatus';
import { SessionContext, type Session } from './session';

const DEV_SESSION: Session = { authEnabled: false, signOut: () => {} };

function currentPath() {
  return window.location.pathname + window.location.search;
}

/**
 * Loads the runtime configuration from the backend, then logs the user in with the company's provider when login is
 * enabled. Children render only once the user is authenticated (or immediately when login is disabled).
 */
export function AuthRoot({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AppConfig>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<AppConfig>;
      })
      .then(setConfig)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <FullPageError
        title={t('startup.unreachableTitle')}
        message={t('startup.unreachableMessage')}
        actionLabel={t('common.retry')}
        onAction={() => window.location.reload()}
      />
    );
  }
  if (!config) return <FullPageLoader />;
  if (!config.authEnabled) return <SessionContext.Provider value={DEV_SESSION}>{children}</SessionContext.Provider>;
  return <OidcRoot config={config}>{children}</OidcRoot>;
}

function OidcRoot({ config, children }: { config: AppConfig; children: ReactNode }) {
  const userManager = useMemo(
    () =>
      new UserManager({
        authority: config.authority ?? '',
        client_id: config.clientId ?? '',
        redirect_uri: `${window.location.origin}/`,
        post_logout_redirect_uri: `${window.location.origin}/`,
        scope: config.scope,
        response_type: 'code',
        automaticSilentRenew: true,
        userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      }),
    [config],
  );

  useEffect(() => {
    configureApiAuth(
      async () => (await userManager.getUser())?.access_token ?? null,
      () => void userManager.signinRedirect({ state: currentPath() }),
    );
  }, [userManager]);

  // After login, go back to the page the user originally asked for.
  const onSigninCallback = (user: User | void) => {
    const returnTo = user && typeof user.state === 'string' ? user.state : '/';
    window.history.replaceState({}, document.title, returnTo);
  };

  return (
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      void auth.signinRedirect({ state: currentPath() });
    }
  }, [auth]);

  if (auth.error) {
    return (
      <FullPageError
        title={t('startup.loginFailedTitle')}
        message={auth.error.message}
        actionLabel={t('startup.tryAgain')}
        onAction={() => void auth.signinRedirect({ state: '/' })}
      />
    );
  }
  if (!auth.isAuthenticated) return <FullPageLoader label={t('startup.signingIn')} />;

  const profile = auth.user?.profile;
  const session: Session = {
    authEnabled: true,
    userName: profile?.name ?? profile?.preferred_username ?? profile?.email,
    email: profile?.email,
    signOut: () => void auth.signoutRedirect(),
  };
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

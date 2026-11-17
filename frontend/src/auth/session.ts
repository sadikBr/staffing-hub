import { createContext, useContext } from 'react';

export interface Session {
  /** False in local development (backend 'dev' profile): nobody logs in. */
  authEnabled: boolean;
  userName?: string;
  email?: string;
  signOut: () => void;
}

export const SessionContext = createContext<Session>({ authEnabled: false, signOut: () => {} });

export function useSession(): Session {
  return useContext(SessionContext);
}

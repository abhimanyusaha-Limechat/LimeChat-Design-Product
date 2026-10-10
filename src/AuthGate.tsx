import type { ReactNode } from 'react';
import { ClerkProvider, Show } from '@clerk/react';
import { SignInPage } from './components/SignInPage';

const localization = {
  signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to continue to LimeChat' } },
  signUp: { start: { title: 'Create your account', subtitle: 'Get started with LimeChat' } },
};

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

/** Shows the app only to signed-in users; everyone else gets the sign-in page. */
export function AuthGate({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <p style={{ padding: 24 }}>Missing VITE_CLERK_PUBLISHABLE_KEY — add it to .env and restart the dev server.</p>;
  }
  return (
    <ClerkProvider publishableKey={publishableKey} localization={localization}>
      <Show when="signed-out"><SignInPage /></Show>
      <Show when="signed-in">{children}</Show>
    </ClerkProvider>
  );
}

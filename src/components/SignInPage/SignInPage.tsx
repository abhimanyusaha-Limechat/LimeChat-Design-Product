import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { LimeChatLogo } from '../Sidebar/icons';
import './SignInPage.css';

type Mode = 'sign-in' | 'sign-up';

const appearance = {
  variables: {
    colorPrimary: '#508014',
    colorForeground: '#3c492c',
    fontFamily: 'Lato, sans-serif',
    borderRadius: '8px',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', overflow: 'visible', boxShadow: 'none', border: 'none', background: 'transparent' },
    card: { boxShadow: 'none', border: 'none', background: 'transparent', padding: 0, margin: 0, width: '100%', gap: '28px' },
    main: { gap: '20px', margin: 0, width: '100%' },
    header: { textAlign: 'left', gap: '6px' },
    headerTitle: { fontSize: '28px', fontWeight: 700, letterSpacing: '-0.01em' },
    headerSubtitle: { fontSize: '15px', color: '#595d57' },
    socialButtonsBlockButton: {
      minHeight: '44px',
      borderColor: '#d9d9d9',
      boxShadow: 'none',
      transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease',
      '&:hover': { backgroundColor: '#fafafa' },
      '&:active': { transform: 'scale(0.98)' },
    },
    socialButtonsBlockButtonText: { fontSize: '15px', fontWeight: 600 },
    dividerText: { fontSize: '13px', color: '#808975' },
    formFieldLabel: { fontSize: '14px', fontWeight: 600 },
    formFieldInput: {
      height: '44px',
      fontSize: '15px',
      borderColor: '#d9d9d9',
      boxShadow: 'none',
    },
    formFieldErrorText: { fontSize: '13px' },
    footer: { display: 'none' }, // we render our own mode switch below the form
    formButtonPrimary: {
      height: '44px',
      fontSize: '15px',
      fontWeight: 600,
      background: '#508014',
      boxShadow: 'none',
      transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease',
      '&::after': { display: 'none' }, // Clerk's gloss overlay
      '&:hover': { background: '#34540d' },
      '&:active': { transform: 'scale(0.98)' },
    },
    buttonArrowIcon: { display: 'none' },
  },
};

/** Full-screen auth page. Layout/branding is ours; the forms are Clerk's, themed via `appearance`. */
export function SignInPage() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const isSignIn = mode === 'sign-in';

  return (
    <main className="sign-in-page">
      <section className="sign-in-page__hero" aria-hidden="true">
        <LimeChatLogo className="sign-in-page__logo" />
        <h2 className="sign-in-page__headline">Every conversation, one workspace.</h2>
        <div className="sign-in-page__bubbles">
          <p className="sign-in-page__bubble">Hi! Is my order out for delivery?</p>
          <p className="sign-in-page__bubble sign-in-page__bubble--reply">Yes — arriving today by 6 PM.</p>
        </div>
      </section>
      <section className="sign-in-page__panel">
        <div className="sign-in-page__form">
          {isSignIn ? (
            <SignIn routing="hash" appearance={appearance} />
          ) : (
            <SignUp routing="hash" appearance={appearance} />
          )}
          <p className="sign-in-page__switch">
            {isSignIn ? 'New to LimeChat?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setMode(isSignIn ? 'sign-up' : 'sign-in')}>
              {isSignIn ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

import { describe, expect, it } from 'vitest';
import { contactMatches } from './ContactsScreen';
import { DEMO_CONTACTS } from '../../data/contactsDemo';

const priya = DEMO_CONTACTS.find((c) => c.name === 'Priya Sharma')!;
const rahul = DEMO_CONTACTS.find((c) => c.name === 'Rahul Verma')!;

describe('contactMatches', () => {
  it('matches everyone on an empty search', () => {
    expect(contactMatches(rahul, 'instagram', '  ')).toBe(true);
  });

  it('matches phone on digits only, ignoring spaces and dashes', () => {
    expect(contactMatches(priya, 'phone', '98201 44')).toBe(true);
    expect(contactMatches(priya, 'phone', '91-9820144312')).toBe(true);
    expect(contactMatches(priya, 'phone', 'priya')).toBe(false);
  });

  it('matches email, name and Instagram case-insensitively within the chosen field only', () => {
    expect(contactMatches(priya, 'email', 'SHARMA@gmail')).toBe(true);
    expect(contactMatches(priya, 'name', 'sharma@')).toBe(false);
    expect(contactMatches(priya, 'name', 'priya sh')).toBe(true);
    expect(contactMatches(priya, 'instagram', '@Priya.Styles')).toBe(true);
    expect(contactMatches(rahul, 'instagram', 'rahul')).toBe(false);
  });
});

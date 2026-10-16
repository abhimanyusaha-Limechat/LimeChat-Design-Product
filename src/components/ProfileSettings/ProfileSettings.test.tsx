import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ProfileSettings, TIMEZONE_OPTIONS, type HelpDeskContact } from './ProfileSettings';

const CONTACT: HelpDeskContact = {
  displayName: 'Aditi',
  phone: '+91 98765 43210',
  webrtcId: 'aditi@webrtc',
  timezone: TIMEZONE_OPTIONS[0],
  address: '',
};

const base = { email: 'team@limechat.ai', name: 'Aditi Rao', onNameChange: () => {}, apiKeyMasked: 'lcuat.X', apiKeyExpiry: 'Never' };

describe('ProfileSettings', () => {
  it('shows only Email and Name without HelpDesk contact fields', () => {
    render(<ProfileSettings {...base} />);
    expect(screen.getByLabelText('Name')).toHaveValue('Aditi Rao');
    expect(screen.queryByLabelText('WebRTC ID')).toBeNull();
    expect(screen.queryByLabelText('Access token')).toBeNull();
  });

  it('adds a copy-only Access token row', () => {
    render(<ProfileSettings {...base} contact={CONTACT} accessTokenMasked="lcat.X" />);
    expect(screen.getByLabelText('Access token')).toHaveValue('lcat.X');
    expect(screen.getByLabelText('API key')).toHaveValue('lcuat.X');
    expect(screen.getByRole('button', { name: 'Copy Access token' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Generate new token/ })).toBeNull();
    expect(screen.getAllByText(/^Expires:/)).toHaveLength(1);
  });

  it('toggles ActionCable receipt collection from the table', () => {
    const onChange = vi.fn();
    render(<ProfileSettings {...base} contact={CONTACT} actionCableReceipts={{ checked: false, onChange }} />);
    const toggle = screen.getByRole('switch', { name: 'ActionCable event receipt collection' });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('accepts a small image as the profile picture and rejects other files', () => {
    const onChange = vi.fn();
    render(<ProfileSettings {...base} avatar={{ onChange }} />);
    expect(screen.getByText('AR')).toBeInTheDocument();
    const input = screen.getByLabelText('Upload profile picture');

    fireEvent.change(input, { target: { files: [new File(['x'], 'cv.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Use a JPG, PNG or WebP image.');
    expect(onChange).not.toHaveBeenCalled();

    const photo = new File(['x'], 'me.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [photo] } });
    expect(onChange).toHaveBeenCalledWith(photo);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the HelpDesk fields and reports edits', () => {
    const onContactChange = vi.fn();
    render(<ProfileSettings {...base} contact={CONTACT} onContactChange={onContactChange} />);

    const profile = within(screen.getByRole('region', { name: 'Profile' }));
    for (const label of ['Full name', 'Display name', 'Email address', 'Phone number', 'WebRTC ID', 'Timezone', 'Address']) {
      expect(profile.getByLabelText(label)).toBeInTheDocument();
    }
    const access = within(screen.getByRole('region', { name: 'Access' }));
    expect(access.getByLabelText('API key')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Timezone'), { target: { value: TIMEZONE_OPTIONS[3] } });
    expect(onContactChange).toHaveBeenLastCalledWith({ ...CONTACT, timezone: TIMEZONE_OPTIONS[3] });

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+1 555' } });
    expect(onContactChange).toHaveBeenLastCalledWith({ ...CONTACT, phone: '+1 555' });
  });
});

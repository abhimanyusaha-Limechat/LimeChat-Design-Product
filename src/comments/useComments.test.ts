import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAppNavigation } from '../hooks/useAppNavigation';
import * as api from './api';
import { useComments } from './useComments';

vi.mock('@clerk/react', () => {
  const getToken = async () => 'token';
  return { useAuth: () => ({ getToken }) };
});

vi.mock('./api', async (importOriginal) => {
  const real = await importOriginal<typeof import('./api')>();
  return { ...real, listComments: vi.fn(async () => []), amIDesigner: vi.fn(async () => false) };
});

describe('useComments', () => {
  // Comments are filed under the Screen (ADR 0002), and in-app navigation uses pushState,
  // which fires no event of its own.
  it('follows the Screen through in-app navigation', async () => {
    const listComments = vi.mocked(api.listComments);
    const { result } = renderHook(() => ({ comments: useComments(), nav: useAppNavigation() }));
    await waitFor(() => expect(listComments).toHaveBeenLastCalledWith('#/helpdesk/tickets', expect.anything()));

    act(() => result.current.nav.openTicket('t-6'));
    await waitFor(() =>
      expect(listComments).toHaveBeenLastCalledWith('#/helpdesk/tickets?ticket=t-6', expect.anything()),
    );
  });
});

import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inspector } from '../components/Inspector';
import * as api from './api';
import type { Comment } from './api';

vi.mock('@clerk/react', () => {
  const getToken = async () => 'token';
  return { useAuth: () => ({ getToken }) };
});

vi.mock('./api', async (importOriginal) => {
  const real = await importOriginal<typeof import('./api')>();
  return {
    ...real,
    COMMENTS_ENABLED: true,
    listComments: vi.fn(),
    addComment: vi.fn(),
    addReply: vi.fn(),
    resolveComment: vi.fn(),
    amIDesigner: vi.fn(),
  };
});

const listComments = vi.mocked(api.listComments);
const addComment = vi.mocked(api.addComment);
const amIDesigner = vi.mocked(api.amIDesigner);

const comment = (over: Partial<Comment> = {}): Comment => ({
  id: 'c1',
  screen: '#/helpdesk/tickets',
  anchor: 'row',
  anchor_key: null,
  in_overlay: false,
  x: 0.5,
  y: 0.5,
  viewport_w: 1024,
  viewport_h: 768,
  body: 'Padding looks off',
  author_id: 'user_1',
  author_name: 'Ana Reviewer',
  build_sha: 'abc1234',
  created_at: new Date().toISOString(),
  replies: [],
  ...over,
});

beforeEach(() => {
  // jsdom has no layout or hit-testing.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 10, y: 10, width: 100, height: 20 }));
  document.elementsFromPoint = () => [];
  listComments.mockResolvedValue([]);
  addComment.mockResolvedValue();
  amIDesigner.mockResolvedValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  localStorage.clear();
});

const appClick = vi.fn();
const commentButton = () => screen.getByRole('button', { name: 'Comment' });
const selectButton = () => screen.getByRole('button', { name: 'Select element' });
const composer = () => screen.queryByRole('dialog', { name: 'New comment' });

async function setup() {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <button type="button" data-anchor="row" onClick={appClick}>
        App button
      </button>
      <Inspector />
    </StrictMode>,
  );
  await user.click(screen.getByRole('button', { name: 'Inspect spacing and type' }));
  await waitFor(() => expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument());
  return user;
}

describe('Comment tool', () => {
  it('opens a composer on click without the app seeing the press', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    expect(composer()).toBeInTheDocument();
    expect(appClick).not.toHaveBeenCalled();
  });

  it('posts the Comment with its Screen and Anchor', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    await user.type(within(composer()!).getByRole('textbox', { name: 'Comment' }), 'Too tight');
    await user.click(within(composer()!).getByRole('button', { name: 'Post' }));
    expect(addComment).toHaveBeenCalledWith(
      expect.objectContaining({ screen: expect.stringMatching(/^#\/helpdesk\//), anchor: 'row', anchor_key: null, body: 'Too tight' }),
    );
    await waitFor(() => expect(composer()).not.toBeInTheDocument());
  });

  it('keeps the draft open and its text when posting fails', async () => {
    addComment.mockRejectedValueOnce(new Error('network'));
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    await user.type(within(composer()!).getByRole('textbox'), 'Keep me');
    await user.click(within(composer()!).getByRole('button', { name: 'Post' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't post");
    expect(within(composer()!).getByRole('textbox')).toHaveValue('Keep me');
  });

  it('lets you type "c" in the composer without toggling the tool', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    await user.type(within(composer()!).getByRole('textbox'), 'c');
    expect(within(composer()!).getByRole('textbox')).toHaveValue('c');
    expect(commentButton()).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not lose draft text to a stray click', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    await user.type(within(composer()!).getByRole('textbox'), 'hi');
    await user.click(screen.getByRole('button', { name: 'App button' }));
    expect(within(composer()!).getByRole('textbox')).toHaveValue('hi');
  });

  it('opens with the Comment tool on', async () => {
    await setup();
    expect(commentButton()).toHaveAttribute('aria-pressed', 'true');
    expect(selectButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('steps back one layer per Esc: confirm discard, discard, close the bar', async () => {
    const user = await setup();
    await user.click(screen.getByRole('button', { name: 'App button' }));
    await user.type(within(composer()!).getByRole('textbox'), 'draft');

    await user.keyboard('{Escape}');
    expect(screen.getByText('Press Esc again to discard.')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(composer()).not.toBeInTheDocument();
    expect(commentButton()).toHaveAttribute('aria-pressed', 'true');

    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Inspect spacing and type' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows Resolve only to the Designer', async () => {
    listComments.mockResolvedValue([comment()]);
    amIDesigner.mockResolvedValue(true);
    const user = await setup();
    await user.click(await screen.findByRole('button', { name: /Padding looks off/ }));
    expect(await screen.findByRole('button', { name: 'Resolve' })).toBeInTheDocument();
  });

  it('hides Resolve from everyone else', async () => {
    listComments.mockResolvedValue([comment()]);
    const user = await setup();
    await user.click(await screen.findByRole('button', { name: /Padding looks off/ }));
    expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resolve' })).not.toBeInTheDocument();
  });

  it('says you are signed out instead of showing an empty list', async () => {
    listComments.mockRejectedValue(new api.SignedOutError());
    await setup();
    expect(screen.getByText(/You're signed out/)).toBeInTheDocument();
    expect(screen.queryByText('No comments on this screen.')).not.toBeInTheDocument();
  });

  it("drops a slow response for a Screen you've already left", async () => {
    let finishFirst: (rows: Comment[]) => void = () => {};
    listComments.mockImplementationOnce(() => new Promise((resolve) => (finishFirst = resolve)));
    const user = userEvent.setup();
    render(<Inspector />);
    await user.click(screen.getByRole('button', { name: 'Inspect spacing and type' }));

    act(() => {
      window.location.hash = '#/marketing/broadcast';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await screen.findByText('No comments on this screen.');
    await act(async () => finishFirst([comment({ body: 'Stale' })]));
    expect(screen.queryByText(/Stale/)).not.toBeInTheDocument();
    expect(screen.getByText('No comments on this screen.')).toBeInTheDocument();
  });
});

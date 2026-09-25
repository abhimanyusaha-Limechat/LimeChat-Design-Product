import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble delivery status', () => {
  it.each(['sent', 'delivered', 'read'] as const)('exposes "%s" to assistive tech, not only as a colour', (status) => {
    render(
      <MessageBubble side="agent" time="10:00" status={status}>
        Hi
      </MessageBubble>,
    );
    expect(screen.getByRole('img', { name: status[0].toUpperCase() + status.slice(1) })).toBeInTheDocument();
  });
});

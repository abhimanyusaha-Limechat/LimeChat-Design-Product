import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductThumb } from './ProductThumb';

describe('ProductThumb', () => {
  it('shows a static tinted placeholder when there is no image', () => {
    render(<ProductThumb colorKey="prod_001" name="Runner" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('opens the full-size photo from the thumbnail and closes it again', async () => {
    const user = userEvent.setup();
    render(<ProductThumb colorKey="prod_001" imageUrl="/runner.png" name="Runner" />);
    await user.click(screen.getByRole('button', { name: 'View Runner image' }));
    expect(screen.getByAltText('Runner')).toBeInTheDocument();
    await user.click(document.querySelector('.lc-thumb-preview__close') as HTMLElement);
    expect(screen.queryByAltText('Runner')).toBeNull();
  });

  it('opens with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ProductThumb colorKey="prod_001" imageUrl="/runner.png" name="Runner" />);
    screen.getByRole('button', { name: 'View Runner image' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByAltText('Runner')).toBeInTheDocument();
  });
});

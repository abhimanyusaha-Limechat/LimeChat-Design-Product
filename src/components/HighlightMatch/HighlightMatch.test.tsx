import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HighlightMatch } from './HighlightMatch';

describe('HighlightMatch', () => {
  it('marks the first case-insensitive match', () => {
    const { container } = render(<HighlightMatch text="Running Shoes" query="shoe" />);
    expect(container.querySelector('mark')).toHaveTextContent('Shoe');
    expect(container).toHaveTextContent('Running Shoes');
  });

  it('renders plain text for an empty or non-matching query', () => {
    expect(render(<HighlightMatch text="Running Shoes" query="  " />).container.querySelector('mark')).toBeNull();
    expect(render(<HighlightMatch text="Running Shoes" query="zzz" />).container.querySelector('mark')).toBeNull();
  });
});

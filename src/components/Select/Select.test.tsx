import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NativeSelect } from './Select';

describe('NativeSelect', () => {
  it('associates the label with the control so it is reachable by name', () => {
    render(<NativeSelect label="Channel" data={['WhatsApp', 'Instagram', 'Email']} />);
    expect(screen.getByLabelText('Channel')).toBeInTheDocument();
  });

  it('supports keyboard selection and calls onChange with the picked value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NativeSelect label="Channel" data={['WhatsApp', 'Instagram', 'Email']} onChange={onChange} />,
    );
    const select = screen.getByLabelText('Channel');
    await user.selectOptions(select, 'Instagram');
    expect(onChange).toHaveBeenCalled();
    expect(select).toHaveValue('Instagram');
  });

  it('renders a disabled placeholder option that cannot be re-selected', () => {
    const { container } = render(
      <NativeSelect label="Channel" placeholder="Pick one" data={['WhatsApp', 'Email']} />,
    );
    const placeholderOption = container.querySelector('option[value=""]');
    expect(placeholderOption).toHaveTextContent('Pick one');
    expect(placeholderOption).toBeDisabled();
  });

  it('marks the control invalid and shows the error message when `error` is a string', () => {
    render(<NativeSelect label="Reach" data={['Everyone']} error="Required" />);
    expect(screen.getByLabelText('Reach')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});

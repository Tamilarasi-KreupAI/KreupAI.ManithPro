import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Textarea, Select, Checkbox, Switch, RadioGroup, FormField } from '../Form';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />);

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Textarea label="Description" isRequired />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Textarea label="Description" helperText="Enter a brief description" />);

    expect(screen.getByText('Enter a brief description')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Textarea label="Description" errorMessage="This field is required" />);

    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('displays success message', () => {
    render(<Textarea label="Description" successMessage="Looks good!" />);

    expect(screen.getByText('Looks good!')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(
      <Textarea label="Description" value="Hello" showCharCount maxLength={100} />
    );

    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Textarea textareaSize="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('text-sm');

    rerender(<Textarea textareaSize="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('text-base');
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    render(<Textarea label="Description" onChange={handleChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'Test');

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  // Wrapper component for controlled select
  const SelectWrapper = ({ onChange }: { onChange?: (value: string) => void }) => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        options={options}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
        label="Choose option"
      />
    );
  };

  it('renders with label', () => {
    render(<Select options={options} label="Choose option" />);

    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(<Select options={options} placeholder="Select something" />);

    expect(screen.getByText('Select something')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Select options={options} label="Choose" isRequired />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select options={options} errorMessage="Selection required" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Selection required');
  });

  it('shows helper text', () => {
    render(<Select options={options} helperText="Pick one" />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<SelectWrapper />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('selects option on click', async () => {
    const onChange = vi.fn();
    render(<SelectWrapper onChange={onChange} />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onChange).toHaveBeenCalledWith('option1');
  });

  it('can be disabled', () => {
    render(<Select options={options} disabled />);

    expect(screen.getByRole('button')).toHaveAttribute('data-disabled', 'true');
  });

  it('applies size variants', () => {
    const { rerender } = render(<Select options={options} size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Select options={options} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });
});

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox label="Accept terms" />);

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox label="Accept terms" checked />);

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);

    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Checkbox label="Accept terms" description="Read the terms first" />);

    expect(screen.getByText('Read the terms first')).toBeInTheDocument();
  });

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept" onChange={onChange} />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('handles keyboard interaction', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept" onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await userEvent.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows indeterminate state', () => {
    render(<Checkbox label="Select all" indeterminate />);

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('can be disabled', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept" disabled onChange={onChange} />);

    expect(screen.getByRole('checkbox')).toHaveAttribute('tabindex', '-1');
  });

  it('applies size variants', () => {
    const { container, rerender } = render(<Checkbox label="Check" size="sm" />);
    expect(container.querySelector('.h-4.w-4')).toBeInTheDocument();

    rerender(<Checkbox label="Check" size="lg" />);
    expect(container.querySelector('.h-6.w-6')).toBeInTheDocument();
  });
});

describe('Switch', () => {
  it('renders unchecked by default', () => {
    render(<Switch label="Enable feature" />);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Switch label="Enable feature" />);

    expect(screen.getByText('Enable feature')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Switch label="Notifications" description="Receive email updates" />);

    expect(screen.getByText('Receive email updates')).toBeInTheDocument();
  });

  it('calls onChange when toggled', async () => {
    const onChange = vi.fn();
    render(<Switch label="Enable" onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('can be disabled', () => {
    render(<Switch label="Enable" disabled />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Switch label="Toggle" size="sm" />);
    expect(screen.getByRole('switch')).toHaveClass('h-5');

    rerender(<Switch label="Toggle" size="lg" />);
    expect(screen.getByRole('switch')).toHaveClass('h-7');
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2', description: 'With description' },
    { value: 'opt3', label: 'Option 3', disabled: true },
  ];

  // Wrapper for controlled RadioGroup
  const RadioGroupWrapper = ({ onChange }: { onChange?: (value: string) => void }) => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <RadioGroup
        options={options}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
        label="Select option"
      />
    );
  };

  it('renders with label', () => {
    render(<RadioGroup options={options} label="Select option" />);

    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<RadioGroup options={options} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders option descriptions', () => {
    render(<RadioGroup options={options} />);

    expect(screen.getByText('With description')).toBeInTheDocument();
  });

  it('selects option on click', async () => {
    const onChange = vi.fn();
    render(<RadioGroupWrapper onChange={onChange} />);

    await userEvent.click(screen.getByText('Option 1'));

    expect(onChange).toHaveBeenCalledWith('opt1');
  });

  it('renders vertically by default', () => {
    const { container } = render(<RadioGroup options={options} orientation="vertical" />);

    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  it('renders horizontally when specified', () => {
    const { container } = render(<RadioGroup options={options} orientation="horizontal" />);

    expect(container.querySelector('.flex-row')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { container, rerender } = render(<RadioGroup options={options} size="sm" />);
    expect(container.querySelector('.h-4.w-4')).toBeInTheDocument();

    rerender(<RadioGroup options={options} size="lg" />);
    expect(container.querySelector('.h-6.w-6')).toBeInTheDocument();
  });
});

describe('FormField', () => {
  it('renders with label', () => {
    render(
      <FormField label="Field Label">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Field Label')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(
      <FormField label="Field" isRequired>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <FormField label="Field" helperText="Some help">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Some help')).toBeInTheDocument();
  });

  it('displays error message with alert role', () => {
    render(
      <FormField label="Field" errorMessage="Error occurred">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Error occurred');
  });

  it('error takes precedence over helper text', () => {
    render(
      <FormField label="Field" helperText="Help" errorMessage="Error">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <FormField label="Field">
        <input type="text" data-testid="child-input" />
      </FormField>
    );

    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <FormField label="Field" className="custom-field">
        <input type="text" />
      </FormField>
    );

    expect(container.querySelector('.custom-field')).toBeInTheDocument();
  });
});

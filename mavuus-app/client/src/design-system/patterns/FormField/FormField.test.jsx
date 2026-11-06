import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { Checkbox, Input, RadioGroup, Select, Textarea } from '../../primitives'
import { FormField } from './FormField'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function describedByIds(element) {
  return (element.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
}

describe('FormField', () => {
  it('should label the input so getByLabelText finds it', () => {
    render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('should describe the input with the hint and the error', () => {
    render(
      <FormField label="Email" hint="We never share it." error="Enter a valid email.">
        <Input type="email" />
      </FormField>,
    )
    const input = screen.getByLabelText('Email')
    expect(describedByIds(input)).toHaveLength(2)
    expect(input).toHaveAccessibleDescription('We never share it. Enter a valid email.')
  })

  it('should set aria-invalid and the error style when there is an error', () => {
    const { rerender } = render(
      <FormField label="Email">
        <Input />
      </FormField>,
    )
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
    rerender(
      <FormField label="Email" error="Enter a valid email.">
        <Input />
      </FormField>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email')).toHaveClass('border-status-error')
  })

  it('should render the error with an icon inside a polite live region', () => {
    render(
      <FormField label="Email" error="Enter a valid email.">
        <Input />
      </FormField>,
    )
    const error = screen.getByText('Enter a valid email.')
    expect(error).toHaveClass('text-status-error', 'text-body-sm')
    expect(error.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(error.closest('[aria-live="polite"]')).not.toBeNull()
  })

  it('should keep the live region mounted when there is no error so a new error is announced', () => {
    const { container } = render(
      <FormField label="Email">
        <Input />
      </FormField>,
    )
    expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()
  })

  it('should mark the field required in the label and on the control', () => {
    render(
      <FormField label="Company" required>
        <Input />
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: 'Company (required)' })
    expect(input).toBeRequired()
  })

  it('should keep the child id and aria-describedby', () => {
    render(
      <>
        <span id="extra">Shown on your profile.</span>
        <FormField label="Headline" hint="Up to 80 characters.">
          <Textarea id="headline" aria-describedby="extra" />
        </FormField>
      </>,
    )
    const field = screen.getByLabelText('Headline')
    expect(field).toHaveAttribute('id', 'headline')
    expect(field).toHaveAccessibleDescription('Shown on your profile. Up to 80 characters.')
  })

  it('should pass the wiring to a render function child', () => {
    render(
      <FormField label="Budget" hint="In US dollars." error="Required.">
        {({ id, describedBy, invalid, required }) => (
          <input id={id} aria-describedby={describedBy} aria-invalid={invalid} required={required} />
        )}
      </FormField>,
    )
    const input = screen.getByLabelText('Budget')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('In US dollars. Required.')
  })

  it('should work with Select', () => {
    render(
      <FormField label="Work type" hint="Pick one." error="Choose a work type.">
        <Select items={[{ value: 'remote', label: 'Remote' }]} placeholder="Select" />
      </FormField>,
    )
    const select = screen.getByRole('combobox', { name: 'Work type' })
    expect(select).toBe(screen.getByLabelText('Work type'))
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Pick one. Choose a work type.')
  })

  it('should put the label next to a Checkbox with the inline layout and toggle it from the label', async () => {
    const user = userEvent.setup()
    render(
      <FormField label="Accept the terms" layout="inline" error="You need to accept the terms.">
        <Checkbox />
      </FormField>,
    )
    const box = screen.getByRole('checkbox', { name: 'Accept the terms' })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAccessibleDescription('You need to accept the terms.')
    expect(box.parentElement).toContainElement(screen.getByText('Accept the terms'))
    await user.click(screen.getByText('Accept the terms'))
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('should label a RadioGroup with aria-labelledby when group is set', () => {
    render(
      <FormField label="Seniority" group hint="Your current level.">
        <RadioGroup
          options={[
            { value: 'vp', label: 'VP' },
            { value: 'cmo', label: 'CMO' },
          ]}
        />
      </FormField>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Seniority' })
    expect(group).toHaveAccessibleDescription('Your current level.')
    expect(screen.getByText('Seniority').tagName).not.toBe('LABEL')
  })

  it('should warn and fall back to stacked when the layout is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <FormField label="Email" layout="grid">
        <Input />
      </FormField>,
    )
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/FormField: layout "grid"/))
  })

  it('should pass className and props to the root', () => {
    render(
      <FormField label="Email" className="col-span-2" data-testid="field">
        <Input />
      </FormField>,
    )
    expect(screen.getByTestId('field')).toHaveClass('col-span-2', 'flex')
  })
})

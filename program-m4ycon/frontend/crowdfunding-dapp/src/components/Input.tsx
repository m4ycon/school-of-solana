'use client'

import { TextField, TextFieldProps } from '@mui/material'
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form'
import { FieldError } from 'react-hook-form'

export type InputRules = RegisterOptions<FieldValues, string>

export interface InputProps extends Omit<TextFieldProps, 'name' | 'label'> {
  name: string
  label: string
  rules?: InputRules
  onChangeCustom?: (value: string) => void
}

export const Input = ({
  name,
  label,
  type = 'text',
  rules,
  onChangeCustom,
  ...props
}: InputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors[name] as FieldError | undefined

  const { onChange, ...restRegister } = register(name, rules)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    onChangeCustom?.(newValue)
    await onChange(event)
  }

  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      {...restRegister}
      onChange={handleChange}
      error={!!error}
      helperText={error?.message}
      margin="normal"
      slotProps={{ htmlInput: { step: 'any' } }}
      {...props}
    />
  )
}

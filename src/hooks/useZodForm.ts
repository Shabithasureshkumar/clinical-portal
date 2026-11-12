import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

/**
 * React Hook Form bound to a Zod schema. Validates on submit, then re-validates as the user edits.
 * Frontend validation improves feedback only: the backend must validate every request again.
 */
export function useZodForm<TIn extends FieldValues, TOut extends FieldValues = TIn>(
  schema: z.ZodType<TOut, TIn>,
  options: Omit<UseFormProps<TIn, unknown, TOut>, 'resolver'> = {},
): UseFormReturn<TIn, unknown, TOut> {
  return useForm<TIn, unknown, TOut>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    ...options,
    resolver: zodResolver(schema as never) as Resolver<TIn, unknown, TOut>,
  })
}

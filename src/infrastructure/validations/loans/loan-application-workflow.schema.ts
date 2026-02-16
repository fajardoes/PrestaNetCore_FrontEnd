import * as yup from 'yup'

export const loanApplicationSubmitSchema = yup.object({
  notes: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export const loanApplicationApproveSchema = yup.object({
  notes: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export const loanApplicationRejectSchema = yup.object({
  reason: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export const loanApplicationCancelSchema = yup.object({
  reason: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export type LoanApplicationSubmitValues = yup.InferType<
  typeof loanApplicationSubmitSchema
>
export type LoanApplicationApproveValues = yup.InferType<
  typeof loanApplicationApproveSchema
>
export type LoanApplicationRejectValues = yup.InferType<
  typeof loanApplicationRejectSchema
>
export type LoanApplicationCancelValues = yup.InferType<
  typeof loanApplicationCancelSchema
>

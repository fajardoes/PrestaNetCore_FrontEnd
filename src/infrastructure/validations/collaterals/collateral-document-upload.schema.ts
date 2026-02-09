import * as yup from 'yup'

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'] as const
const maxSizeInBytes = 10 * 1024 * 1024

export const collateralDocumentUploadSchema = yup.object({
  file: yup
    .mixed<File>()
    .required('Selecciona un archivo.')
    .test('file-type', 'Solo se permiten PDF, JPG o PNG.', (value) => {
      if (!value) return false
      return allowedMimeTypes.includes(value.type as (typeof allowedMimeTypes)[number])
    })
    .test('file-size', 'El tamaño máximo es 10 MB.', (value) => {
      if (!value) return false
      return value.size <= maxSizeInBytes
    }),
  documentType: yup
    .string()
    .trim()
    .max(50, 'El tipo de documento no puede superar 50 caracteres.')
    .required('Selecciona un tipo de documento.'),
})

export type CollateralDocumentUploadFormValues = yup.InferType<
  typeof collateralDocumentUploadSchema
>

export const collateralDocumentValidationRules = {
  maxSizeInBytes,
  allowedMimeTypes,
}

import * as yup from 'yup'

export const documentTemplateCreateSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Usa letras, números, puntos, guiones o guiones bajos.')
    .max(80, 'El código no puede superar 80 caracteres.')
    .required('El código es obligatorio.'),
  name: yup.string().trim().max(200, 'El nombre no puede superar 200 caracteres.').required('El nombre es obligatorio.'),
  description: yup.string().trim().max(2000, 'La descripción no puede superar 2,000 caracteres.').defined(),
  documentTypeId: yup.string().uuid('Selecciona un tipo documental.').required('Selecciona un tipo documental.'),
})

export const documentTemplateMetadataSchema = yup.object({
  name: yup.string().trim().max(200, 'El nombre no puede superar 200 caracteres.').required('El nombre es obligatorio.'),
  description: yup.string().trim().max(2000, 'La descripción no puede superar 2,000 caracteres.').defined(),
  isActive: yup.boolean().required(),
})

export const documentTemplateVersionSchema = yup.object({
  bodyHtml: yup
    .string()
    .max(262144, 'El contenido principal supera el tamaño permitido.')
    .required('El contenido principal es obligatorio.')
    .test('body-has-content', 'Agrega texto, una variable o la tabla controlada de cuotas.', (value) => {
      const text = (value ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;|&#160;/gi, ' ')
        .trim()
      return text.length > 0
    }),
  headerHtml: yup.string().max(262144, 'El encabezado supera el tamaño permitido.').defined(),
  footerHtml: yup.string().max(262144, 'El pie supera el tamaño permitido.').defined(),
  pageSize: yup.string().oneOf(['LETTER', 'LEGAL', 'A4']).required(),
  orientation: yup.string().oneOf(['PORTRAIT', 'LANDSCAPE']).required(),
  marginTopMm: yup.number().typeError('Ingresa un margen numérico.').min(0, 'El margen no puede ser negativo.').max(999999.99, 'El margen excede el rango permitido.').required('El margen es obligatorio.'),
  marginRightMm: yup.number().typeError('Ingresa un margen numérico.').min(0, 'El margen no puede ser negativo.').max(999999.99, 'El margen excede el rango permitido.').required('El margen es obligatorio.'),
  marginBottomMm: yup.number().typeError('Ingresa un margen numérico.').min(0, 'El margen no puede ser negativo.').max(999999.99, 'El margen excede el rango permitido.').required('El margen es obligatorio.'),
  marginLeftMm: yup.number().typeError('Ingresa un margen numérico.').min(0, 'El margen no puede ser negativo.').max(999999.99, 'El margen excede el rango permitido.').required('El margen es obligatorio.'),
  requiredVariableCodes: yup.array().of(yup.string().required()).required(),
})

export type DocumentTemplateCreateFormValues = yup.InferType<typeof documentTemplateCreateSchema>
export type DocumentTemplateMetadataFormValues = yup.InferType<typeof documentTemplateMetadataSchema>
export type DocumentTemplateVersionFormValues = yup.InferType<typeof documentTemplateVersionSchema>

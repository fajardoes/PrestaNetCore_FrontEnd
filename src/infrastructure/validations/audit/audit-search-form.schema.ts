import * as yup from 'yup'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AUDIT_CODE_PATTERN = /^[a-z0-9._-]+$/i
const MILLISECONDS_PER_DAY = 86_400_000

const requiredDate = (label: string) =>
  yup
    .string()
    .required(`La fecha ${label} es obligatoria.`)
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.')

const uuidFilter = (label: string) =>
  yup
    .string()
    .defined()
    .test('uuid', `El ID de ${label} debe tener formato UUID.`, (value) =>
      !value?.trim() || UUID_PATTERN.test(value.trim()),
    )

const auditCodeFilter = (label: string, maxLength: number) =>
  yup
    .string()
    .defined()
    .max(maxLength, `El código de ${label} supera el máximo permitido.`)
    .matches(AUDIT_CODE_PATTERN, {
      message: `El código de ${label} solo puede incluir letras, números, punto, guion y guion bajo.`,
      excludeEmptyString: true,
    })

export const auditSearchFormSchema = yup
  .object({
    fromDate: requiredDate('inicial'),
    toDate: requiredDate('final'),
    categoryCode: yup.string().defined(),
    moduleCode: auditCodeFilter('módulo', 80),
    actionCode: yup.string().defined(),
    outcomeCode: yup.string().defined(),
    errorCode: auditCodeFilter('error', 120),
    actorUserId: uuidFilter('usuario'),
    agencyId: uuidFilter('agencia'),
    correlationId: yup.string().defined().max(128, 'La correlación supera el máximo permitido.'),
    requestMethod: yup.string().defined().max(12, 'El método HTTP supera el máximo permitido.'),
    httpStatusCode: yup
      .string()
      .defined()
      .test('http-status', 'El estado HTTP debe estar entre 100 y 599.', (value) => {
        if (!value) return true
        const status = Number(value)
        return Number.isInteger(status) && status >= 100 && status <= 599
      }),
    routeTemplate: yup.string().defined().max(512, 'La ruta supera el máximo permitido.'),
    subjectType: yup.string().defined().max(100, 'El tipo de entidad supera el máximo permitido.'),
    subjectId: yup.string().defined().max(128, 'El identificador supera el máximo permitido.'),
  })
  .test('date-range', function validateDateRange(values) {
    if (!values?.fromDate || !values.toDate) return true
    if (values.fromDate > values.toDate) {
      return this.createError({
        path: 'toDate',
        message: 'La fecha final no puede ser anterior a la fecha inicial.',
      })
    }

    const [fromYear, fromMonth, fromDay] = values.fromDate.split('-').map(Number)
    const [toYear, toMonth, toDay] = values.toDate.split('-').map(Number)
    const dayCount =
      (Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      MILLISECONDS_PER_DAY
    if (dayCount > 366) {
      return this.createError({
        path: 'toDate',
        message: 'El rango de búsqueda no puede superar 366 días.',
      })
    }

    return true
  })
  .test('subject-pair', function validateSubjectPair(values) {
    if (!values) return true
    if (Boolean(values.subjectType.trim()) === Boolean(values.subjectId.trim())) return true
    return this.createError({
      path: values.subjectId.trim() ? 'subjectType' : 'subjectId',
      message: 'Para filtrar por entidad debes indicar tanto el tipo como el identificador.',
    })
  })

export type AuditSearchFormValues = yup.InferType<typeof auditSearchFormSchema>

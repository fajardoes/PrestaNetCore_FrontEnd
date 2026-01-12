import { z } from 'zod'

export const referenceSchema = z.object({
  id: z.string().optional(),
  nombreCompleto: z
    .string({ required_error: 'El nombre de la referencia es obligatorio.' })
    .trim()
    .min(1, 'El nombre de la referencia es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  telefono: z
    .string({ required_error: 'El teléfono es obligatorio.' })
    .trim()
    .min(1, 'El teléfono es obligatorio.')
    .max(20, 'Máximo 20 caracteres.'),
  parentesco: z
    .string({ required_error: 'El parentesco es obligatorio.' })
    .trim()
    .min(1, 'El parentesco es obligatorio.')
    .max(150, 'Máximo 150 caracteres.'),
  address: z
    .string()
    .trim()
    .max(300, 'Máximo 300 caracteres.')
    .optional()
    .nullable(),
  lugarTrabajo: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres.')
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
})

export const activitySchema = z.object({
  id: z.string().optional(),
  sectorId: z.string().trim().optional().nullable(),
  actividadId: z
    .string({ required_error: 'La actividad es obligatoria.' })
    .trim()
    .min(1, 'Selecciona la actividad económica.'),
  nombreEmpresa: z
    .string({ required_error: 'El nombre de la empresa es obligatorio.' })
    .trim()
    .min(1, 'El nombre de la empresa es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  descripcion: z
    .string()
    .trim()
    .max(300, 'Máximo 300 caracteres.')
    .optional()
    .nullable(),
  telefono: z
    .string()
    .trim()
    .max(20, 'Máximo 20 caracteres.')
    .optional()
    .nullable(),
  ingresosMensuales: z.coerce
    .number({ required_error: 'Los ingresos mensuales son obligatorios.' })
    .min(0, 'El valor mínimo es 0.'),
  gastosMensuales: z.coerce
    .number({ required_error: 'Los gastos mensuales son obligatorios.' })
    .min(0, 'El valor mínimo es 0.'),
  lugarActividad: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres.')
    .optional()
    .nullable(),
  tiempoActividadMeses: z.coerce
    .number({ required_error: 'El tiempo de actividad es obligatorio.' })
    .min(0, 'El valor mínimo es 0.'),
  esPrincipal: z.boolean().default(false),
  esNegocio: z.boolean().default(false),
  activo: z.boolean().default(true),
})

export const clientSchema = z
  .object({
    nombreCompleto: z
      .string({ required_error: 'El nombre completo es obligatorio.' })
      .trim()
      .min(3, 'Ingresa al menos 3 caracteres.')
      .max(200, 'Máximo 200 caracteres.'),
    identidad: z
      .string({ required_error: 'La identidad es obligatoria.' })
      .trim()
      .length(13, 'Debe contener 13 dígitos.')
      .regex(/^\d+$/, 'Solo se permiten dígitos.'),
    rtn: z
      .string()
      .trim()
      .max(25, 'Máximo 25 caracteres.')
      .optional()
      .nullable(),
    address: z
      .string({ required_error: 'La dirección es obligatoria.' })
      .trim()
      .min(5, 'Ingresa una dirección válida.')
      .max(300, 'Máximo 300 caracteres.'),
    telefono: z
      .string()
      .trim()
      .max(20, 'Máximo 20 caracteres.')
      .optional()
      .nullable(),
    generoId: z
      .string({ required_error: 'El género es obligatorio.' })
      .trim()
      .min(1, 'Selecciona un género.'),
    estadoCivilId: z
      .string({ required_error: 'El estado civil es obligatorio.' })
      .trim()
      .min(1, 'Selecciona un estado civil.'),
    profesionId: z
      .string({ required_error: 'La profesión es obligatoria.' })
      .trim()
      .min(1, 'Selecciona una profesión.'),
    fechaNacimiento: z
      .string({ required_error: 'La fecha de nacimiento es obligatoria.' })
      .trim(),
    municipioId: z
      .string({ required_error: 'El municipio es obligatorio.' })
      .trim()
      .min(1, 'Selecciona un municipio.'),
    esEmpleado: z.boolean().default(false),
    tiempoResidirMeses: z.coerce
      .number({ required_error: 'Indica el tiempo de residencia.' })
      .min(0, 'El valor mínimo es 0.'),
    dependientesId: z
      .string({ required_error: 'Los dependientes son obligatorios.' })
      .trim()
      .min(1, 'Selecciona una opción.'),
    tipoViviendaId: z
      .string({ required_error: 'El tipo de vivienda es obligatorio.' })
      .trim()
      .min(1, 'Selecciona una opción.'),
    referencias: z.array(referenceSchema).default([]),
    actividades: z.array(activitySchema).default([]),
  })
  .superRefine((values, ctx) => {
    const principales = values.actividades.filter(
      (actividad) => actividad.esPrincipal && actividad.activo !== false,
    )
    if (principales.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Solo se permite una actividad principal por cliente.',
        path: ['actividades'],
      })
    }
  })

export type ClientFormValues = z.infer<typeof clientSchema>
export type ClientReferenceFormValues = z.infer<typeof referenceSchema>
export type ClientActivityFormValues = z.infer<typeof activitySchema>

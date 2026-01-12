export interface ClientReference {
  id?: string
  nombreCompleto: string
  telefono: string
  parentesco: string
  address?: string | null
  lugarTrabajo?: string | null
  activo?: boolean
}

export interface ClientActivity {
  id?: string
  actividadId: string
  actividadNombre?: string | null
  sectorNombre?: string | null
  sectorId?: string
  nombreEmpresa: string
  descripcion?: string | null
  telefono?: string | null
  ingresosMensuales: number
  gastosMensuales: number
  lugarActividad?: string | null
  tiempoActividadMeses: number
  esPrincipal: boolean
  esNegocio: boolean
  activo?: boolean
}

export interface ClientListItem {
  id: string
  nombreCompleto: string
  identidad: string
  rtn?: string | null
  sectorId?: string | null
  sectorNombre?: string | null
  municipioId?: string | null
  municipioNombre?: string | null
  generoId?: string | null
  activo: boolean
}

export interface ClientDetail
  extends Omit<ClientCreatePayload, 'referencias' | 'actividades'> {
  id: string
  activo: boolean
  referencias: ClientReference[]
  actividades: ClientActivity[]
  estadoCivilNombre?: string | null
  profesionNombre?: string | null
  municipioNombre?: string | null
  dependientesNombre?: string | null
  tipoViviendaNombre?: string | null
}

export interface ClientCreatePayload {
  nombreCompleto: string
  identidad: string
  rtn?: string | null
  address: string
  telefono?: string | null
  generoId: string
  estadoCivilId: string
  profesionId: string
  fechaNacimiento: string
  municipioId: string
  esEmpleado: boolean
  tiempoResidirMeses: number
  dependientesId: string
  tipoViviendaId: string
  referencias: ClientReference[]
  actividades: ClientActivity[]
}

export interface ClientUpdatePayload extends ClientCreatePayload {
  activo?: boolean
}

import { useCallback } from 'react'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { AsyncSelectOption } from '@/presentation/share/components/async-select'
import type { PagedResult } from '@/types/pagination'

const resolveClientId = (client: ClientListItem): string => {
  const rawClient = client as ClientListItem & {
    clientId?: string
    clienteId?: string
  }
  const candidate = rawClient.id ?? rawClient.clientId ?? rawClient.clienteId
  return typeof candidate === 'string' ? candidate : ''
}

const toOption = (
  client: ClientListItem,
): AsyncSelectOption<ClientListItem> => ({
  value: resolveClientId(client),
  label: `${client.nombreCompleto}${
    client.identidad ? ` - ${formatHnIdentity(client.identidad)}` : ''
  }`,
  meta: client,
})

export const useCollateralClientSearch = () => {
  const listClients = useCallback(
    async ({
      pageNumber = 1,
      pageSize = 10,
      search,
      active = true,
    }: {
      pageNumber?: number
      pageSize?: number
      search?: string
      active?: boolean
    }): Promise<PagedResult<ClientListItem>> => {
      const result = await listClientsAction(
        {
          pageNumber,
          pageSize,
          search: search?.trim() || undefined,
          activo: active,
          esEmpleado: false,
        },
        { silent: true },
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      const fallbackTotalPages =
        typeof result.data.totalCount === 'number' && result.data.totalCount > 0
          ? Math.ceil(result.data.totalCount / pageSize)
          : 1

      return {
        ...result.data,
        totalPages:
          typeof result.data.totalPages === 'number' && Number.isFinite(result.data.totalPages)
            ? Math.max(1, result.data.totalPages)
            : Math.max(1, fallbackTotalPages),
      }
    },
    [],
  )

  const searchClients = useCallback(
    async (input: string): Promise<AsyncSelectOption<ClientListItem>[]> => {
      const term = input.trim()
      if (term.length < 2) return []

      const result = await listClientsAction({
        pageNumber: 1,
        pageSize: 20,
        search: term,
        activo: true,
        esEmpleado: false,
      })

      if (!result.success) {
        return []
      }

      return result.data.items.map(toOption).filter((option) => option.value.trim().length > 0)
    },
    [],
  )

  const getOptionById = useCallback(async (clientId: string) => {
    const result = await listClientsAction({
      pageNumber: 1,
      pageSize: 1,
      search: clientId,
      activo: true,
      esEmpleado: false,
    })

    if (!result.success) return null

    const found = result.data.items.find((item) => resolveClientId(item) === clientId)
    return found ? toOption(found) : null
  }, [])

  return {
    listClients,
    searchClients,
    getOptionById,
  }
}

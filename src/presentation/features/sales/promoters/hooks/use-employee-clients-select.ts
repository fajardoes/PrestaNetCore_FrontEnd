import { useCallback, useRef } from 'react'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { AsyncSelectOption } from '@/presentation/share/components/async-select'

const PAGE_SIZE = 10

export const useEmployeeClientsSelect = () => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingResolveRef = useRef<
    ((options: AsyncSelectOption<ClientListItem>[]) => void) | null
  >(null)
  const requestIdRef = useRef(0)

  const loadOptions = useCallback(
    (inputValue: string): Promise<AsyncSelectOption<ClientListItem>[]> => {
      const normalized = normalizeSearch(inputValue)
      if (!normalized || normalized.length < 2) {
        return Promise.resolve([])
      }

      return new Promise((resolve) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
          debounceRef.current = null
        }
        if (pendingResolveRef.current) {
          pendingResolveRef.current([])
        }
        pendingResolveRef.current = resolve
        const requestId = ++requestIdRef.current

        debounceRef.current = setTimeout(async () => {
          const result = await listClientsAction({
            pageNumber: 1,
            pageSize: PAGE_SIZE,
            search: normalized,
            activo: true,
            esEmpleado: true,
          })

          if (requestId !== requestIdRef.current) {
            resolve([])
            return
          }

          if (!result.success) {
            resolve([])
            return
          }

          const options = (result.data.items ?? []).map((client) => ({
            value: client.id,
            label: `${client.nombreCompleto}${
              client.identidad ? ` - ${formatHnIdentity(client.identidad)}` : ''
            }`.trim(),
            meta: client,
          }))

          resolve(options)
        }, 350)
      })
    },
    [],
  )

  return { loadOptions }
}

const normalizeSearch = (value?: string) => {
  if (!value) return undefined
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

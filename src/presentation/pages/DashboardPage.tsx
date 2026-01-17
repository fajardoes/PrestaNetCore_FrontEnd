import { useUsers } from '@/hooks/useUsers'

export const DashboardPage = () => {
  const { data, isLoading, error, refetch, canFetch } = useUsers()

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition md:flex-row md:items-center md:justify-between dark:bg-slate-900 dark:ring-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Tablero operativo
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Accede a indicadores en vivo sobre servicios médicos, estados de
            autorización y disponibilidad de especialistas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={!canFetch || isLoading}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Actualizar usuarios
        </button>
      </header>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        {!canFetch ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Inicia sesión para consultar la información de usuarios, cartera de
            servicios y datos clínicos sensibles.
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cargando usuarios...
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        ) : null}

        {!isLoading && !error && data.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                {data.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 uppercase">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export const HomePage = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Bienvenido a Prestanet
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Core Financiero
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Flujo clínico centralizado
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Coordina solicitudes de servicio, autorizaciones y asignación de
            recursos desde un único panel, reduciendo tiempos de respuesta para
            pacientes y personal asistencial.
          </p>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Autenticación segura
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Conecta con el backend de prestanet para validar credenciales, proteger
            la información clínica y mantener sesiones activas con tokens
            renovables.
          </p>
        </article>
      </section>
    </div>
  )
}

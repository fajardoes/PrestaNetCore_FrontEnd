export const AboutPage = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Acerca de prestanet
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          prestanet Core Financiero.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Experiencia clínica
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            El layout combina navegación pública y componentes autenticados para
            que coordinadores y médicos accedan a dashboards, órdenes y
            reportes sin abandonar el flujo de trabajo.
          </p>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Integración con servicios
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            El consumo del backend se realiza a través de servicios tipados que
            administran tokens, refrescos y errores, manteniendo el foco en la
            seguridad de los datos clínicos.
          </p>
        </article>
      </section>
    </div>
  )
}

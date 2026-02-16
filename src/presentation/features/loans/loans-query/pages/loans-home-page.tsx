import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoansHomePage = () => {
  const navigate = useNavigate()
  const [loanId, setLoanId] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Préstamos</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consulta un préstamo usando su identificador.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">ID del préstamo</label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={loanId}
            onChange={(event) => setLoanId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            placeholder="GUID del préstamo"
          />
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              if (!loanId.trim()) return
              navigate(`/loans/${loanId.trim()}`)
            }}
          >
            Consultar
          </button>
        </div>
      </div>
    </div>
  )
}

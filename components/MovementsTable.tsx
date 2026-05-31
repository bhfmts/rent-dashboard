import type { FintocMovement } from '@/lib/types'

function clp(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Row({ mov, type }: { mov: FintocMovement; type: 'ingreso' | 'gasto' }) {
  const name = type === 'ingreso'
    ? (mov.sender_account?.holder_name || mov.description)
    : mov.description

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm text-gray-200 font-medium capitalize truncate max-w-[200px]" title={name}>
          {name.toLowerCase()}
        </p>
        {type === 'ingreso' && mov.description && (
          <p className="text-xs text-gray-600 truncate max-w-[200px]">{mov.description}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(mov.post_date)}</td>
      <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${
        type === 'ingreso' ? 'text-green-400' : 'text-red-400'
      }`}>
        {type === 'gasto' ? '-' : '+'}{clp(Math.abs(mov.amount))}
      </td>
    </tr>
  )
}

interface Props {
  ingresos: FintocMovement[]
  gastos: FintocMovement[]
}

export default function MovementsTable({ ingresos, gastos }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Arriendos recibidos
          </h2>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{ingresos.length}</span>
        </div>
        {ingresos.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-600 text-center">Sin ingresos en este período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 text-xs font-medium text-gray-600">Remitente</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map(m => <Row key={m.id} mov={m} type="ingreso" />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Gastos hipotecarios
          </h2>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{gastos.length}</span>
        </div>
        {gastos.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-600 text-center">Sin gastos en este período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 text-xs font-medium text-gray-600">Descripción</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map(m => <Row key={m.id} mov={m} type="gasto" />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

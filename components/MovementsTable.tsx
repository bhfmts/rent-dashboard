import type { FintocMovement } from '@/lib/types'

function clp(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function decodeDesc(text: string): string {
  try { return decodeURIComponent(text) } catch { return text }
}

function cleanMortgageDesc(raw: string): string {
  const desc = decodeDesc(raw).trim()
  if (/pac banco conso/i.test(desc)) return 'PAC Banco Consorcio'
  if (/pac hip/i.test(desc)) return 'PAC BancoEstado'
  if (/traspaso a cuenta de otro banco/i.test(desc)) return 'Traspaso a otro banco'
  // "Pago Cuota Crédito Hipotec. N° 500006497007" → "Hipotecario N° 500006497"
  const match = desc.match(/n[°o]\s*(\d{6,})/i)
  if (match) return `Hipotecario N° ${match[1].slice(0, 9)}`
  return desc
}

function Row({ mov, type }: { mov: FintocMovement; type: 'ingreso' | 'gasto' }) {
  const rawName = type === 'ingreso'
    ? (mov.sender_account?.holder_name || mov.description)
    : mov.description

  const displayName = type === 'gasto'
    ? cleanMortgageDesc(rawName)
    : decodeDesc(rawName)

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm text-gray-200 font-medium capitalize leading-snug">
          {displayName.toLowerCase()}
        </p>
        {type === 'ingreso' && mov.description && mov.sender_account?.holder_name && (
          <p className="text-xs text-gray-600 mt-0.5">{decodeDesc(mov.description)}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap align-top pt-4">{formatDate(mov.post_date)}</td>
      <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap align-top pt-4 ${
        type === 'ingreso' ? 'text-green-400' : 'text-red-400'
      }`}>
        {type === 'gasto' ? '-' : '+'}{clp(Math.abs(mov.amount))}
      </td>
    </tr>
  )
}

function Table({ title, color, movements, type, emptyMsg, colHeader }: {
  title: string
  color: string
  movements: FintocMovement[]
  type: 'ingreso' | 'gasto'
  emptyMsg: string
  colHeader: string
}) {
  const total = movements.reduce((s, m) => s + Math.abs(m.amount), 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${type === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
            {type === 'ingreso' ? '+' : '-'}{clp(total)}
          </span>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{movements.length}</span>
        </div>
      </div>
      {movements.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-600 text-center">{emptyMsg}</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-800/50">
              <th className="px-4 py-2 text-xs font-medium text-gray-600">{colHeader}</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600 whitespace-nowrap">Fecha</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600 text-right whitespace-nowrap">Monto</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => <Row key={m.id} mov={m} type={type} />)}
          </tbody>
        </table>
      )}
    </div>
  )
}

interface Props {
  ingresos: FintocMovement[]
  gastos: FintocMovement[]
}

export default function MovementsTable({ ingresos, gastos }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Table
        title="Arriendos recibidos"
        color="bg-green-500"
        movements={ingresos}
        type="ingreso"
        emptyMsg="Sin ingresos en este período"
        colHeader="Remitente"
      />
      <Table
        title="Gastos hipotecarios"
        color="bg-red-500"
        movements={gastos}
        type="gasto"
        emptyMsg="Sin gastos en este período"
        colHeader="Descripción"
      />
    </div>
  )
}

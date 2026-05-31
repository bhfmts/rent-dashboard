function clp(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

interface Props {
  totalIngresos: number
  totalGastos: number
}

export default function SummaryCards({ totalIngresos, totalGastos }: Props) {
  const balance = totalIngresos + totalGastos // gastos are negative

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ingresos arriendos</p>
        <p className="text-2xl font-bold text-green-400">{clp(totalIngresos)}</p>
        <p className="text-xs text-gray-600 mt-1">Pagos recibidos en el período</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gastos hipotecarios</p>
        <p className="text-2xl font-bold text-red-400">{clp(Math.abs(totalGastos))}</p>
        <p className="text-xs text-gray-600 mt-1">Cuotas pagadas en el período</p>
      </div>

      <div className={`border rounded-2xl p-5 ${
        balance >= 0
          ? 'bg-green-950/30 border-green-900/50'
          : 'bg-red-950/30 border-red-900/50'
      }`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Balance neto</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {clp(balance)}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {balance >= 0 ? 'Positivo — queda en tu bolsillo' : 'Negativo — debes cubrir la diferencia'}
        </p>
      </div>
    </div>
  )
}

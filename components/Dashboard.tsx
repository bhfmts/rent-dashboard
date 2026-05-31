'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { FilteredMovements } from '@/lib/types'
import Header from './Header'
import SummaryCards from './SummaryCards'
import MovementsChart from './MovementsChart'
import MovementsTable from './MovementsTable'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function Dashboard({ user }: { user: User }) {
  const [since, setSince] = useState(firstOfMonthStr())
  const [until, setUntil] = useState(todayStr())
  const [data, setData] = useState<FilteredMovements | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/movements?since=${since}&until=${until}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      const json: FilteredMovements = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [since, until])

  useEffect(() => { fetchData() }, [fetchData])

  const totalIngresos = data?.ingresos.reduce((s, m) => s + m.amount, 0) ?? 0
  const totalGastos = data?.gastos.reduce((s, m) => s + m.amount, 0) ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Date range picker */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Desde</label>
              <input
                type="date"
                value={since}
                onChange={e => setSince(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                value={until}
                onChange={e => setUntil(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
              <button
                onClick={() => {
                  const d = new Date()
                  setSince(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
                  setUntil(todayStr())
                }}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors whitespace-nowrap"
                title="Mes actual"
              >
                Este mes
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl h-72 animate-pulse" />
          </div>
        )}

        {data && (
          <>
            <SummaryCards totalIngresos={totalIngresos} totalGastos={totalGastos} />
            {(data.ingresos.length > 0 || data.gastos.length > 0) ? (
              <>
                <MovementsChart ingresos={data.ingresos} gastos={data.gastos} />
                <MovementsTable ingresos={data.ingresos} gastos={data.gastos} />
              </>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-400 font-medium">Sin movimientos en este período</p>
                <p className="text-gray-600 text-sm mt-1">Prueba ampliando el rango de fechas</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

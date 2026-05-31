'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { FintocMovement } from '@/lib/types'

interface Props {
  ingresos: FintocMovement[]
  gastos: FintocMovement[]
}

function shortName(text: string, maxLen = 16): string {
  if (!text) return 'Sin nombre'
  const clean = text.replace(/pago cuota cr[eé]dito hipotec\. n[o°]/gi, 'Hipotecario')
                    .replace(/pac hip_bestado.*/i, 'Hipotecario PAC')
                    .replace(/\b(SPA|LTDA|S\.A\.)\b/gi, '')
                    .trim()
  return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean
}

function clpShort(value: number) {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

interface ChartEntry { name: string; amount: number; type: 'ingreso' | 'gasto' }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartEntry; value: number }[] }) => {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  const formatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.abs(entry.amount))
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-gray-200">{entry.name}</p>
      <p className={`text-lg font-bold mt-0.5 ${entry.type === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
        {entry.type === 'gasto' ? '-' : ''}{formatted}
      </p>
    </div>
  )
}

export default function MovementsChart({ ingresos, gastos }: Props) {
  const incomeData: ChartEntry[] = ingresos.map(m => ({
    name: shortName(m.sender_account?.holder_name || m.description),
    amount: m.amount,
    type: 'ingreso',
  }))

  const expenseData: ChartEntry[] = gastos.map(m => ({
    name: shortName(m.description),
    amount: m.amount,
    type: 'gasto',
  }))

  const data = [...incomeData, ...expenseData]

  if (data.length === 0) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Movimientos del período
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            tickFormatter={clpShort}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="amount" position="top" formatter={(v: unknown) => clpShort(Math.abs(Number(v)))} style={{ fill: '#6b7280', fontSize: 10 }} />
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.type === 'ingreso' ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Arriendos
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Hipotecarios
        </span>
      </div>
    </div>
  )
}

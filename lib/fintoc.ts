import type { FintocMovement, FilteredMovements } from './types'

const SECRET_KEY = process.env.FINTOC_SECRET_KEY!
const LINK_TOKEN = process.env.FINTOC_LINK_TOKEN!
const ACCOUNT_ID = process.env.FINTOC_ACCOUNT_ID!

const INCOME_HOLDERS = [
  'jose gerardo marin queipo',
  'insurtech spa',
  'juan nicolas fernandez brand',
  'wendy chantal',
  'lilian andrea pavez salinas',
]

const EXPENSE_DESCRIPTIONS = [
  'pago cuota credito hipotec. n° 540',
  'pago cuota credito hipotec. n° 500',
  'pac hip_bestado 00000110457190',
]

const EXPENSE_AMOUNTS = [-35000]

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
}

async function getAllMovements(): Promise<FintocMovement[]> {
  const baseUrl = `https://api.fintoc.com/v1/accounts/${ACCOUNT_ID}/movements`
  const headers = {
    accept: 'application/json',
    Authorization: SECRET_KEY,
  }

  const allMovements: FintocMovement[] = []
  let params = new URLSearchParams({ link_token: LINK_TOKEN, per_page: '50' })

  while (true) {
    const response = await fetch(`${baseUrl}?${params}`, { headers, cache: 'no-store' })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Fintoc error ${response.status}: ${body}`)
    }

    const data: FintocMovement[] = await response.json()
    allMovements.push(...data)

    const linkHeader = response.headers.get('link') || ''
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
    if (!nextMatch) break

    const nextUrl = new URL(nextMatch[1])
    const cursor = nextUrl.searchParams.get('cursor')
    if (!cursor) break

    params = new URLSearchParams({ link_token: LINK_TOKEN, per_page: '50', cursor })
  }

  return allMovements
}

export async function getFilteredMovements(since: string, until: string): Promise<FilteredMovements> {
  const allMovements = await getAllMovements()

  const sinceDate = new Date(since)
  const untilDate = new Date(until)
  untilDate.setHours(23, 59, 59)

  const filtered = allMovements.filter(mov => {
    if (!mov.post_date) return false
    const d = new Date(mov.post_date.slice(0, 10))
    return d >= sinceDate && d <= untilDate
  })

  const ingresos: FintocMovement[] = []
  const gastos: FintocMovement[] = []

  for (const mov of filtered) {
    const desc = normalizeText(mov.description || '')
    const sender = normalizeText(mov.sender_account?.holder_name || '')

    if (INCOME_HOLDERS.some(name => sender.includes(name))) {
      ingresos.push(mov)
    } else if (EXPENSE_DESCRIPTIONS.some(d => desc.includes(d))) {
      gastos.push(mov)
    } else if (EXPENSE_AMOUNTS.includes(mov.amount)) {
      gastos.push(mov)
    }
  }

  return { ingresos, gastos }
}

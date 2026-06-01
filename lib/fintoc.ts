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
  'pablo andres badilla cordero',
  'maria elisa uzcategui',
]

// Simplified patterns that match both URL-encoded and plain versions after normalization
const EXPENSE_DESCRIPTION_PATTERNS = [
  'hipotec',          // matches "credito hipotecario" in any encoding
  'pac hip',          // matches "pac hip_bestado"
  'pac banco conso',  // matches "pac banco consorcio"
]

const EXPENSE_TRANSFER_PATTERN = 'traspaso a cuenta de otro banco'

// Monthly fixed transfer of $35,000 (sent to pay BancoEstado mortgage from another account)
const EXPENSE_AMOUNTS = [-35000]

function normalizeText(text: string): string {
  // URL-decode first — Fintoc sometimes returns percent-encoded descriptions
  let decoded = text
  try { decoded = decodeURIComponent(text) } catch {}
  return decoded
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
  let params = new URLSearchParams({ link_token: LINK_TOKEN, per_page: '100' })

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
    const page = nextUrl.searchParams.get('page')
    if (!page) break

    params = new URLSearchParams({ link_token: LINK_TOKEN, per_page: '100', page })
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

    const isIngreso = INCOME_HOLDERS.some(name => sender.includes(name) || desc.includes(name))
    const isGasto =
      EXPENSE_DESCRIPTION_PATTERNS.some(p => desc.includes(p)) ||
      (mov.amount === -35000 && desc.includes(EXPENSE_TRANSFER_PATTERN))

    if (isIngreso) {
      ingresos.push(mov)
    } else if (isGasto) {
      gastos.push(mov)
    }
  }

  return { ingresos, gastos }
}

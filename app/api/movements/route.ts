import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFilteredMovements } from '@/lib/fintoc'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')
  const until = searchParams.get('until')

  if (!since || !until) {
    return NextResponse.json({ error: 'Se requieren parámetros since y until' }, { status: 400 })
  }

  try {
    const data = await getFilteredMovements(since, until)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Fintoc error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

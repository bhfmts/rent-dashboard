export interface FintocMovement {
  id: string
  description: string
  amount: number
  currency: string
  post_date: string
  type: string
  sender_account?: {
    holder_name: string
    number?: string
  }
  recipient_account?: {
    holder_name: string
    number?: string
  }
}

export interface FilteredMovements {
  ingresos: FintocMovement[]
  gastos: FintocMovement[]
}

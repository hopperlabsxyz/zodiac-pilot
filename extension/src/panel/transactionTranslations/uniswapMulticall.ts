import { KnownContracts } from '@gnosis.pm/zodiac'
import { UnfoldVertical } from 'lucide-react'
import type { TransactionTranslation } from './types'
import { unwrapMulticall } from './utils'

export const uniswapMulticall = {
  title: 'Unfold individual calls',
  icon: UnfoldVertical,
  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction) => {
    const { to, data, value } = transaction

    if (!data) {
      return undefined
    }

    if (value > 0) {
      // We don't support unfolding of transactions with value since it's hard to tell which individual calls are supposed to receive the value
      return undefined
    }

    const functionCalls = unwrapMulticall(data)

    if (functionCalls.length === 0) {
      return undefined
    }

    return functionCalls.map((data) => ({ to, data, value: 0n }))
  },
} satisfies TransactionTranslation

import type { HexAddress } from '@/types'
import type { Result } from 'ethers'
import type { ChainId, MetaTransactionRequest } from 'ser-kit'

export interface CallHandlerParam {
  transaction: MetaTransactionRequest
  chainId: ChainId
  avatarAddress: HexAddress
  params: Result
}

export type BundlerCallHandler = (
  param: CallHandlerParam,
) => Promise<MetaTransactionRequest[]>

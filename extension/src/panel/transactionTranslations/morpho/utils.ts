import { getReadOnlyProvider } from '@/providers'
import type { HexAddress } from '@/types'
import { Contract } from 'ethers'
import type { ChainId } from 'ser-kit'

export function createContract(
  address: HexAddress,
  iface: any,
  chainId: ChainId,
) {
  const provider = getReadOnlyProvider(chainId)
  return new Contract(address, iface, provider)
}

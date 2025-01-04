import type { HexAddress } from '@/types'
import { Interface, type FunctionFragment } from 'ethers'

const multicallInterface = new Interface([
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(uint256 deadline, bytes[] calldata data) external returns (bytes[] memory results)',
  'function multicall(bytes32 previousBlockhash, bytes[] calldata data) external returns (bytes[] memory results)',
])

export function unwrapMulticall(data: HexAddress): HexAddress[] {
  let functionCalls: HexAddress[] = []
  for (const fragment of multicallInterface.fragments) {
    if (fragment.type !== 'function') continue
    try {
      functionCalls = multicallInterface.decodeFunctionData(
        fragment as FunctionFragment,
        data,
      ).data as HexAddress[]
      break
    } catch {
      continue
    }
  }
  return functionCalls
}

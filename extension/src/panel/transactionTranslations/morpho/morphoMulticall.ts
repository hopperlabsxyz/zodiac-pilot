import { getReadOnlyProvider } from '@/providers'
import type { HexAddress } from '@/types'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { Contract, FunctionFragment, Interface } from 'ethers'
import { UnfoldVertical } from 'lucide-react'
import type { TransactionTranslation } from '../types'
import { unwrapMulticall } from '../utils'

const morphoErc4626Interface = new Interface([
  'function erc4626Deposit(address, uint256, uint256, address) external payable',
  'function erc4626Mint(address, uint256, uint256, address) external payable',
  'function erc4626Redeem(address, uint256, uint256, address, address) external payable',
  'function erc4626Withdraw(address, uint256, uint256, address, address) external payable',
  'function morphoSupplyCollateral((address,address,address,address,uint256) marketParams,uint256 assets,address onBehalf,bytes data) external payable',
])

const erc4626Interface = new Interface([
  'function deposit(uint256, address) external payable',
  'function mint(uint256, address) external payable',
  'function redeem(uint256, address, address) external payable',
  'function withdraw(uint256, address, address) external payable',
  'function approve(address, uint256) external',
  'function asset() external view returns (address)',
  'function convertToAssets(uint256) external view returns (uint256)',
])

const morphoInterface = new Interface([
  'function supplyCollateral((address,address,address,address,uint256) marketParams, uint256 assets, address onBehalf, bytes calldata data)',
])

const CHAIN_AGNOSTIC_BUNDLER_V2 = '0x23055618898e202386e6c13955a58D3C68200BFB'
const ETHEREUM_BUNDLER_V2 = '0x4095F064B8d3c3548A3bebfd0Bbfd04750E30077'
const MORPHO = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'

const MORPHO_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  8453: 'base',
}

export const morphoMulticall = {
  title: 'Unfold individual calls',
  icon: UnfoldVertical,
  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction, chainId, avatarAddress) => {
    const { data, value, to } = transaction

    if (!MORPHO_SUPPORTED_NETWORK[chainId]) {
      // not on a network where Morpho is deployed
      return undefined
    }

    if (
      to.toLowerCase() !== CHAIN_AGNOSTIC_BUNDLER_V2.toLowerCase() &&
      to.toLowerCase() !== ETHEREUM_BUNDLER_V2.toLowerCase()
    ) {
      // not a call to Morpho Bundler
      return undefined
    }

    if (!data) {
      return undefined
    }

    if (value > 0) {
      // We don't support unfolding of transactions with value since it's hard to tell which individual calls are supposed to receive the value
      return undefined
    }

    const provider = getReadOnlyProvider(chainId)

    const functionCalls = unwrapMulticall(data)
    console.log('calls', functionCalls)

    const functionCallsConverted: {
      to: HexAddress
      data: HexAddress
      value: bigint
    }[] = []

    console.log(morphoErc4626Interface.fragments)
    await Promise.all(
      functionCalls.map(async (call: HexAddress) => {
        for (const fragment of morphoErc4626Interface.fragments) {
          if (fragment.type !== 'function') continue
          try {
            console.log('HEEEEEEERE 1')
            // reverts if the call is not part of morphoErc4626Interface
            const params = morphoErc4626Interface.decodeFunctionData(
              fragment as FunctionFragment,
              call,
            )
            console.log('HEEEEEEERE 2')

            // Map decoded parameters to ERC-4626 call format
            switch ((fragment as FunctionFragment).name) {
              case 'erc4626Deposit': {
                const metaMorpho = new Contract(
                  params[0],
                  erc4626Interface,
                  provider,
                )
                console.log('HEEEEEEERE')
                const underlyingAddress = await metaMorpho.asset()

                // Add the `approve` call for the underlying token
                functionCallsConverted.push({
                  to: underlyingAddress,
                  data: erc4626Interface.encodeFunctionData('approve', [
                    params[0], // vault address
                    params[1], // amount
                  ]) as HexAddress,
                  value: 0n,
                })

                const newData = erc4626Interface.encodeFunctionData('deposit', [
                  params[1], // assets
                  params[3], // receiver
                ]) as HexAddress

                // Push the translated ERC-4626 call
                functionCallsConverted.push({
                  to: params[0], // vault address
                  data: newData,
                  value: 0n,
                })
                break
              }
              case 'erc4626Mint': {
                const metaMorpho = new Contract(
                  params[0],
                  erc4626Interface,
                  provider,
                )
                const underlyingAddress = await metaMorpho.asset()
                const amount = await metaMorpho.convertToAssets(params[1]) // `params[1]` shares
                const amountWithMargin =
                  amount + BigInt(Math.round(Number(amount) / 500)) // amount + amount * 0.2%

                let newData = erc4626Interface.encodeFunctionData('approve', [
                  params[0], // vault address
                  amountWithMargin,
                ]) as HexAddress
                // Add the `approve` call for the underlying token
                functionCallsConverted.push({
                  to: underlyingAddress,
                  data: newData,
                  value: 0n,
                })

                newData = erc4626Interface.encodeFunctionData('mint', [
                  params[1], // shares
                  params[3], // receiver
                ]) as HexAddress
                // Push the translated ERC-4626 call
                functionCallsConverted.push({
                  to: params[0], // vault address
                  data: newData,
                  value: 0n,
                })
                break
              }
              case 'erc4626Redeem': {
                const newData = erc4626Interface.encodeFunctionData('redeem', [
                  params[1], // shares
                  params[3], // receiver
                  params[4], // owner
                ]) as HexAddress
                // Push the translated ERC-4626 call
                functionCallsConverted.push({
                  to: params[0], // vault address
                  data: newData,
                  value: 0n,
                })
                break
              }
              case 'erc4626Withdraw':
                {
                  const newData = erc4626Interface.encodeFunctionData(
                    'withdraw',
                    [
                      params[1], // assets
                      params[3], // receiver
                      params[4], // owner
                    ],
                  ) as HexAddress
                  // Push the translated ERC-4626 call
                  functionCallsConverted.push({
                    to: params[0], // vault address
                    data: newData,
                    value: 0n,
                  })
                }
                break
              case 'morphoSupplyCollateral': {
                console.log('dont forget to approve')
                let newData = erc4626Interface.encodeFunctionData('approve', [
                  MORPHO,
                  params[1], // assets
                ]) as HexAddress
                functionCallsConverted.push({
                  to: params[0][1], // collateralToken
                  data: newData,
                  value: 0n,
                })
                console.log('params', params)
                console.log(params[0][0])
                newData = morphoInterface.encodeFunctionData(
                  'supplyCollateral',
                  [
                    [
                      params[0][0], // loanToken
                      params[0][1], // collateralToken
                      params[0][2], // oracle
                      params[0][3], // irm
                      params[0][4], // ltv
                    ], // marketParams (tuple)
                    params[1], // assets
                    avatarAddress, // onBehalf
                    '0x', // data (empty bytes)
                  ],
                ) as HexAddress
                functionCallsConverted.push({
                  to: MORPHO, // vault address
                  data: newData,
                  value: 0n,
                })
                break
              }
              default:
                continue
            }
          } catch (error) {
            console.log(error)
            continue
          }
        }
      }),
    )

    console.log(functionCallsConverted)
    if (functionCallsConverted.length === 0) {
      return undefined
    }

    console.log('converted', functionCallsConverted)

    return functionCallsConverted
  },
} satisfies TransactionTranslation
